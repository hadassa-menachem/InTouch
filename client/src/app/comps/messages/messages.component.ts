import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideIconsModule } from '../../lucide.module';
import { UserService } from '../../ser/user.service';
import { User } from '../../classes/User';
import { Subscription, forkJoin } from 'rxjs';
import { Message } from '../../classes/Message';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, LucideIconsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  chats: {
    profilePic: string;
    username: string;
    lastMessage: Message | null;
    userId: string;
    isSentByCurrentUser?: boolean;
    isSeen?: boolean;
    lastSentAt?: number;
    unreadCount?: number; 
  }[] = [];

  filteredChats: typeof this.chats = [];
  searchTerm: string = '';
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private userSer: UserService) {}

  ngOnInit(): void {
    const currentUserId = this.userSer.currentUser?.userId;
    if (!currentUserId) {
      console.error('No current user');
      this.router.navigate(['/login']);
      return;
    }

    this.userSer.startSignalRConnection(currentUserId).then(() => {
      this.setupSignalRListeners(currentUserId);
    }).catch(err => {
      console.error('SignalR connection failed:', err);
    });

    this.getConversations(currentUserId);
  }

  private setupSignalRListeners(currentUserId: string): void {
    this.userSer.onReceiveMessage((message: Message) => {
      
      this.updateChatWithMessage(message, currentUserId);
    });

    this.userSer.onMessageRead((data) => {
      console.log('Message read in messages list:', data);
      
      const chat = this.chats.find(c => 
        c.lastMessage?.id === data.messageId
      );
      
      if (chat && chat.lastMessage) {
        chat.lastMessage.isRead = true;
        chat.isSeen = true;
      }
    });

    this.userSer.onMessagesDelivered((data) => {
      console.log('Messages delivered in messages list:', data);
      
      const chat = this.chats.find(c => c.userId === data.receiverId);
      if (chat && chat.lastMessage && chat.lastMessage.senderId === currentUserId) {
        chat.lastMessage.isDelivered = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getConversations(userId: string) {
    this.userSer.getAllMessagesForUser(userId).subscribe({
      next: (messages) => {
        const partnerUserIds = new Set<string>();
        messages.forEach(m => {
          const otherId = m.senderId === userId ? m.receiverId : m.senderId;
          if (otherId) partnerUserIds.add(otherId);
        });

        const requests = [...partnerUserIds].map(id => this.userSer.GetUserById(id));
        forkJoin(requests).subscribe(users => {
          this.chats = users
            .filter((u): u is User => !!u)
            .map(u => this.buildChat(u, messages, userId))
            .sort((a, b) => (b.lastSentAt || 0) - (a.lastSentAt || 0));

          this.filteredChats = [...this.chats];
        });
      },
      error: (err) => console.error('Error loading conversations:', err)
    });
  }

  buildChat(user: User, messages: Message[], currentUserId: string) {
    const msgs = messages.filter(
      m => m.senderId === user.userId || m.receiverId === user.userId
    );

    const lastMsg = msgs.length
      ? msgs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0]
      : null;

    const unreadMessages = msgs.filter(m => m.senderId === user.userId && !m.isRead).length;

    return {
      userId: user.userId,
      username: `${user.firstName} ${user.lastName}`,
      profilePic: user.profilePicUrl!,
      lastMessage: lastMsg,
      isSentByCurrentUser: lastMsg ? lastMsg.senderId === currentUserId : false,
      isSeen: lastMsg ? lastMsg.isRead : false,
      lastSentAt: lastMsg ? new Date(lastMsg.sentAt).getTime() : 0,
      unreadCount: unreadMessages
    };
  }

  updateChatWithMessage(message: Message, currentUserId: string) {
    const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    const chatIndex = this.chats.findIndex(c => c.userId === otherUserId);

    if (chatIndex !== -1) {
      const chat = this.chats[chatIndex];
      chat.lastMessage = message;
      chat.lastSentAt = new Date(message.sentAt).getTime();
      chat.isSeen = message.isRead;
      chat.isSentByCurrentUser = message.senderId === currentUserId;
      
      if (message.senderId !== currentUserId && !message.isRead) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }

      this.chats.splice(chatIndex, 1);
      this.chats.unshift(chat);
    } else {
      this.userSer.GetUserById(otherUserId).subscribe(user => {
        if (!user) return;
        const newChat = this.buildChat(user, [message], currentUserId);
        this.chats.unshift(newChat);
        this.filteredChats = [...this.chats];
      });
    }

    this.filteredChats = [...this.chats];
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredChats = this.searchTerm
      ? this.chats.filter(chat => chat.username.toLowerCase().includes(this.searchTerm))
      : [...this.chats];
  }

  navigateToChat(userId: string) {
    this.router.navigate(['/chat', userId]);
  }
}