import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../classes/User';
import { LucideIconsModule } from '../../lucide.module';
import { Follow } from '../../classes/Follow';

interface FollowWithUser {
  follow: Follow;
  user: User | null;
}

@Component({
  selector: 'app-followers',
  standalone: true,
  imports: [LucideIconsModule, CommonModule],
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.css']
})
export class FollowersComponent implements OnInit {
  searchTerm: string = '';
  allFollowers: FollowWithUser[] = [];
  filteredFollowers: FollowWithUser[] = [];
  userId: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.userService.getFollowers(this.userId).subscribe({
      next: (follows: Follow[]) => {
        const followWithUserList: FollowWithUser[] = [];
        let loadedCount = 0;

        follows.forEach(follow => {
          this.userService.GetUserById(follow.followerId).subscribe({
            next: (user: User) => {
              followWithUserList.push({ follow, user });
              loadedCount++;
              if (loadedCount === follows.length) {
                this.allFollowers = followWithUserList;
                this.filteredFollowers = [...followWithUserList];
              }
            },
            error: err => {
              console.error(`שגיאה בשליפת משתמש ${follow.followeeId}:`, err);
              followWithUserList.push({ follow, user: null });
              loadedCount++;
              if (loadedCount === follows.length) {
                this.allFollowers = followWithUserList;
                this.filteredFollowers = [...followWithUserList];
              }
            }
          });
        });
      },
      error: err => {
        console.error('שגיאה בטעינת העוקבים:', err);
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!this.searchTerm) {
      this.filteredFollowers = [...this.allFollowers];
    } else {
      this.filteredFollowers = this.allFollowers.filter(item =>
        item.user?.firstName?.toLowerCase().includes(this.searchTerm) ||
        item.user?.lastName?.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  GoToUser(userId: string | undefined): void {
    if (userId) {
      this.router.navigate(['/user-profile', userId]);
    }
  }
}
