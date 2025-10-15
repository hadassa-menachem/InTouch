import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Status } from '../../classes/Status';
import { UserService } from '../../ser/user.service';
import { ActivatedRoute } from '@angular/router';
import { LucideIconsModule } from '../../lucide.module';
import { Location } from '@angular/common';
import { User } from '../../classes/User';

interface StatusGroup {
  userId: string;
  date: string; // yyyy-mm-dd
  statuses: Status[];
}

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconsModule]
})
export class StatusComponent implements OnInit, OnDestroy {
  statusGroups: StatusGroup[] = [];
  commentBoxOpenFor: string | null = null;
  newComment: string = '';
  showLikeAnimation: boolean = false;
  user!:User
  currentGroupIndex: number = 0;
  currentStatusIndex: number = 0;
  progress: number = 0;
  progressInterval: any;
  statusDuration: number = 5000; // זמן לכל סטטוס

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
     this.userService.GetUserById(userId!).subscribe({
      next:(user:User)=>{
        this.user=user;
      }
     })
    this.userService.getStatusByUserId(userId!).subscribe({
      next: (statuses: Status[]) => {
        statuses.forEach(s => {
          if (!s.user) {
            s.user = {
              userId: userId!,
              firstName: '',
              lastName: '',
              profilePicUrl: ''
            };
          }
        });

        this.statusGroups = this.groupStatusesByUser(statuses);

        if (this.statusGroups.length > 0) {
          this.startProgress();
        }
      },
      error: err => console.error(err)
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.progressInterval);
  }

  get currentGroup(): StatusGroup | null {
    return this.statusGroups[this.currentGroupIndex] || null;
  }

  private groupStatusesByUser(statuses: Status[]): StatusGroup[] {
  const groupsMap: { [key: string]: StatusGroup } = {};

  statuses.forEach(status => {
    const key = status.user.userId; 
    if (!groupsMap[key]) {
      groupsMap[key] = { userId: status.user.userId, date: '', statuses: [] };
    }

    groupsMap[key].statuses.push(status);
  });

  return Object.values(groupsMap);
}

  startProgress() {
    this.progress = 0;
    clearInterval(this.progressInterval);
    const step = 100 / (this.statusDuration / 100);

    this.progressInterval = setInterval(() => {
      this.progress += step;
      if (this.progress >= 100) {
        this.nextStatus();
      }
    }, 100);
  }

  nextStatus() {
    if (!this.currentGroup) return;

    if (this.currentStatusIndex < this.currentGroup.statuses.length - 1) {
      this.currentStatusIndex++;
      this.startProgress();
    } else if (this.currentGroupIndex < this.statusGroups.length - 1) {
      // מעבר לקבוצה הבאה
      this.currentGroupIndex++;
      this.currentStatusIndex = 0;
      this.startProgress();
    } else {
      clearInterval(this.progressInterval);
      this.location.back();
    }
  }

  prevStatus() {
    if (!this.currentGroup) return;

    if (this.currentStatusIndex > 0) {
      this.currentStatusIndex--;
      this.startProgress();
    } else if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.currentStatusIndex = this.currentGroup!.statuses.length - 1;
      this.startProgress();
    }
  }

  toggleLike(id: string) {
    this.showLikeAnimation = true;
    setTimeout(() => this.showLikeAnimation = false, 800);
  }

  toggleCommentBox(id: string) {
    this.commentBoxOpenFor = this.commentBoxOpenFor === id ? null : id;
  }

  sendComment(id: string) {
    if (this.newComment.trim()) {
      console.log('Comment', id, this.newComment);
      this.newComment = '';
      this.commentBoxOpenFor = null;
    }
  }

  getTimeAgo(createdAt: Date | string): string {
    if (!createdAt) return '';
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'עכשיו';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    if (diffInDays < 7) return `לפני ${diffInDays} ימים`;
    return `לפני ${Math.floor(diffInDays / 7)} שבועות`;
  }
}
