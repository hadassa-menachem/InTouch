import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from './lucide.module';
import { UserService } from './ser/user.service';
import { User } from './classes/User';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideIconsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})    

export class AppComponent implements OnInit, OnDestroy {
  unreadChatsCount: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(public router: Router, public userService: UserService) {}
  
  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.userService.currentUser = user;

      this.userService.startSignalRConnection(user.userId)
        .then(() => {
          console.log('SignalR connected in AppComponent for user:', user.userId);
          
          this.userService.markAllMessagesAsDelivered(user.userId).subscribe({
            next: () => console.log('All messages marked as delivered'),
            error: err => console.error('Error marking delivered messages', err)
          });

          this.userService.getAllMessagesForUser(user.userId).subscribe(messages => {
            this.userService.calculateUnreadChats(messages, user.userId);
          });
        })
        .catch(err => {
          console.error('SignalR connection failed:', err);
        });
    }
    
    const unreadSub = this.userService.unreadChatsCount$.subscribe(
      count => {
        this.unreadChatsCount = count;
        console.log('Unread chats count:', count);
      }
    );
    this.subscription.add(unreadSub);

    const navSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.userService.currentUser) {
        this.userService.getAllMessagesForUser(this.userService.currentUser.userId).subscribe(messages => {
          this.userService.calculateUnreadChats(messages, this.userService.currentUser!.userId);
        });
      }
    });
    this.subscription.add(navSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  isProfilePage(): boolean {
    return this.router.url.startsWith('/profile');
  }

  ifUser(): boolean {
    return localStorage.getItem('currentUser') == null;
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}