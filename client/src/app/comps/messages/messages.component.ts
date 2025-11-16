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
    lastMessage: string;
    userId: string;
    isSentByCurrentUser?: boolean;
    isSeen?: boolean;
    lastSentAt?: number;
  }[] = [];

  allUsers: User[] = [];
  showUserList: boolean = false;

  constructor(private router: Router, private userSer: UserService) {}

  ngOnInit(): void {
    const currentUserId = this.userSer.currentUser?.userId;
    if (currentUserId) {
      this.getConversations(currentUserId);
    }
    this.loadAllUsers();
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
              const lastMsg = msgs.sort(
                (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
              )[0];

              return {
                userId: u.userId,
                username: `${u.firstName} ${u.lastName}`,
                profilePic: u.profilePicUrl!,
                lastMessage: lastMsg ? lastMsg.content : 'אין הודעות',
                isSentByCurrentUser: lastMsg?.senderId === userId,
                isSeen: lastMsg?.isRead || false,
                lastSentAt: lastMsg ? new Date(lastMsg.sentAt).getTime() : 0
              };
            })
            .sort((a, b) => b.lastSentAt! - a.lastSentAt!);
        });
      },
      error: (err) => {
        console.error('שגיאה בטעינת שיחות:', err);
      }
    });
  }

  navigateToChat(userId: string) {
    this.router.navigate(['/chat', userId]);
  }

  openUserPopup() {
    this.showUserList = true;
  }

  closePopup() {
    this.showUserList = false;
  }

  loadAllUsers() {
    this.userSer.GetAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (err) => {
        console.error('שגיאה בטעינת משתמשים:', err);
      }
    });
  }

  startNewChat(user: User) {
    this.closePopup();
    this.navigateToChat(user.userId);
  }
}
