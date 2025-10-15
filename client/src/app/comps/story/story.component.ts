import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Story } from '../../classes/Story';
import { UserService } from '../../ser/user.service';
import { ActivatedRoute } from '@angular/router';
import { LucideIconsModule } from '../../lucide.module';
import { Location } from '@angular/common';
import { User } from '../../classes/User';

interface StoryGroup {
  userId: string;
  category: string;
  storys: Story[];
}

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconsModule]
})
export class StoryComponent implements OnInit, OnDestroy {
  storyGroups: StoryGroup[] = [];
  commentBoxOpenFor: string | null = null;
  newComment: string = '';
  showLikeAnimation: boolean = false;
  user!: User;
  currentGroupIndex: number = 0;
  currentStoryIndex: number = 0;
  progress: number = 0;
  progressInterval: any;
  storyDuration: number = 5000; // זמן לכל סטטוס

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) return;

    this.userService.GetUserById(userId).subscribe({
      next: (user: User) => {
        this.user = user;
      }
    });

    this.userService.getStoryByUserId(userId).subscribe({
      next: (storys: Story[]) => {
        storys.forEach(s => {
          if (!s.user) {
            s.user = {
              userId: userId,
              firstName: '',
              lastName: '',
              profilePicUrl: ''
            };
          }
        });

        this.storyGroups = this.groupStorysByCategory(storys);

        if (this.storyGroups.length > 0) {
          this.startProgress();
        }
      },
      error: err => console.error(err)
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.progressInterval);
  }

  get currentGroup(): StoryGroup | null {
    return this.storyGroups[this.currentGroupIndex] || null;
  }

  groupStorysByCategory(storys: Story[]): StoryGroup[] {
    const groupsMap: { [key: string]: StoryGroup } = {};

    storys.forEach(story => {
      const key = story.user.userId + '-' + (story.category || 'default');
      if (!groupsMap[key]) {
        groupsMap[key] = {
          userId: story.user.userId,
          category: story.category || 'default',
          storys: []
        };
      }
      groupsMap[key].storys.push(story);
    });

    return Object.values(groupsMap);
  }

  startProgress() {
    this.progress = 0;
    clearInterval(this.progressInterval);
    const step = 100 / (this.storyDuration / 100);

    this.progressInterval = setInterval(() => {
      this.progress += step;
      if (this.progress >= 100) {
        this.nextStatus();
      }
    }, 100);
  }

  nextStatus() {
    if (!this.currentGroup) return;

    if (this.currentStoryIndex < this.currentGroup.storys.length - 1) {
      this.currentStoryIndex++;
      this.startProgress();
    } else if (this.currentGroupIndex < this.storyGroups.length - 1) {
      this.currentGroupIndex++;
      this.currentStoryIndex = 0;
      this.startProgress();
    } else {
      clearInterval(this.progressInterval);
      this.location.back();
    }
  }

  prevStatus() {
    if (!this.currentGroup) return;

    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.startProgress();
    } else if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.currentStoryIndex = this.currentGroup!.storys.length - 1;
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

  selectGroup(index: number) {
    this.currentGroupIndex = index;
    this.currentStoryIndex = 0;
    this.startProgress();
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
