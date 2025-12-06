import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideIconsModule } from '../../lucide.module';
import { UserService } from '../../ser/user.service';
import { User } from '../../classes/User';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, LucideIconsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  chats: {
    profilePic: string;
    username: string;
    lastMessage: any;
    userId: string;
    isSentByCurrentUser?: boolean;
    isSeen?: boolean;
    lastSentAt?: number;
  }[] = [];

  filteredChats: typeof this.chats = [];
  searchTerm: string = '';

  constructor(private router: Router, private userSer: UserService) {}

  ngOnInit(): void {
    const currentUserId = this.userSer.currentUser?.userId;
    if (currentUserId) {
      this.getConversations(currentUserId);
    }
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
            .map(u => {
              const msgs = messages.filter(
                m => m.senderId === u.userId || m.receiverId === u.userId
              );

              const lastMsg = msgs.length
                ? msgs.sort((a, b) =>
                    new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
                  )[0]
                : null;

              return {
                userId: u.userId,
                username: `${u.firstName} ${u.lastName}`,
                profilePic: u.profilePicUrl!,
                lastMessage: lastMsg,
                isSentByCurrentUser: lastMsg ? lastMsg.senderId === userId : false,
                isSeen: lastMsg ? lastMsg.isRead : false,
                lastSentAt: lastMsg ? new Date(lastMsg.sentAt).getTime() : 0
              };
            })
            .sort((a, b) => b.lastSentAt - a.lastSentAt);

          this.filteredChats = [...this.chats];
        });
      },
      error: (err) => console.error('Error loading conversations:', err)
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.filteredChats = [...this.chats];
    } else {
      this.filteredChats = this.chats.filter(chat =>
        chat.username.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  navigateToChat(userId: string) {
    this.router.navigate(['/chat', userId]);
  }
}
