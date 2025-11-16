import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { Router } from '@angular/router';
import { User } from '../../classes/User';
import { LucideIconsModule } from '../../lucide.module';

@Component({
  selector: 'app-search',
  imports: [CommonModule, LucideIconsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true
})
export class SearchComponent {
  searchTerm: string = '';
  allUsers: User[] = [];
  filteredUsers: User[] = [];

  constructor(private userService: UserService, public router: Router) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.userService.GetAllUsers().subscribe({
      next: (users: User[]) => {
        this.allUsers = users;
        this.filteredUsers = [...users];
      },
      error: err => console.error('שגיאה בטעינת משתמשים:', err)
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(user =>
        user.firstName!.toLowerCase().includes(this.searchTerm) ||
        user.lastName!.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  GoToUser(userId: string) {
    this.router.navigate(['/user-profile', userId]);
  }
}
