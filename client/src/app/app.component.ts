import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from './lucide.module';
import { UserService } from './ser/user.service';
import { User } from './classes/User';

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
export class AppComponent implements OnInit {
  constructor(public router: Router, public userService: UserService) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.userService.currentUser = user;

      this.userService.markAllMessagesAsDelivered(user.userId).subscribe({
        next: () => console.log('כל ההודעות סומנו כנמסרו'),
        error: err => console.error('שגיאה בסימון הודעות כנמסרו', err)
      });
    }
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

  logout() {
    this.userService.currentUser = null;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
