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
  selector: 'app-followings',
  standalone: true,
  imports: [LucideIconsModule, CommonModule],
  templateUrl: './followings.component.html',
  styleUrls: ['./followings.component.css']
})
export class FollowingsComponent implements OnInit {
  searchTerm: string = '';
  allFollowings: FollowWithUser[] = [];
  filteredFollowings: FollowWithUser[] = [];
  userId: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.loadAllFollowings();
  }

  loadAllFollowings(): void {
    this.userService.getFollowings(this.userId).subscribe({
      next: (follows: Follow[]) => {
        const followWithUserList: FollowWithUser[] = [];
        let loadedCount = 0;

        follows.forEach(follow => {
          this.userService.GetUserById(follow.followeeId).subscribe({
            next: (user: User) => {
              followWithUserList.push({ follow, user });
              loadedCount++;

              if (loadedCount === follows.length) {
                this.allFollowings = followWithUserList;
                this.filteredFollowings = [...followWithUserList];
              }
            },
            error: err => {
              console.error(`Error retrieving user${follow.followerId}:`, err);
              followWithUserList.push({ follow, user: null });
              loadedCount++;

              if (loadedCount === follows.length) {
                this.allFollowings = followWithUserList;
                this.filteredFollowings = [...followWithUserList];
              }
            }
          });
        });
      },
      error: err => {
        console.error('Error loading followers:', err);
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value
      .toLowerCase()
      .trim();

    if (!this.searchTerm) {
      this.filteredFollowings = [...this.allFollowings];
    } else {
      this.filteredFollowings = this.allFollowings.filter(item =>
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
