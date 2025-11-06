import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideIconsModule } from '../../lucide.module';
import { Story } from '../../classes/Story';
import { User } from '../../classes/User';
import { UserService } from '../../ser/user.service';

interface StoryGroup {
  userId: string;
  category: string;
  stories: Story[];
}

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconsModule]
})
export class StoryComponent implements OnInit, OnDestroy {
  storyGroups: StoryGroup[] = [];        // רק סטוריז קבועות / Highlights
  temporaryStories: Story[] = [];        // רק סטוריז זמניים
  commentBoxOpenFor: string | null = null;
  newComment: string = '';
  showLikeAnimation: boolean = false;
  user!: User;
  currentGroupIndex: number = 0;
  currentStoryIndex: number = 0;
  progress: number = 0;
  progressInterval: any;
  storyDuration: number = 5000;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storyId = this.route.snapshot.paramMap.get('storyId');
    if (!storyId) return;

    this.user = this.userService.getCurrentUser()!;

    // משיכת סטורי לפי ID
    this.userService.getStoryById(storyId).subscribe({
      next: (story: Story) => {
        this.userService.getStoryByUserId(story.user.userId!).subscribe({
          next: (stories: Story[]) => {
            const now = new Date();

            stories.forEach(s => {
              if (!s.user) s.user = { userId: '', firstName: '', lastName: '', profilePicUrl: '' };
              s.likes = s.likes || [];
              s.comments = s.comments || [];
              s.viewedByUserIds = s.viewedByUserIds || [];
              s.viewedByCurrentUser = s.viewedByUserIds.includes(this.user.userId);

              const created = new Date(s.createdAt);
              const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

              if (s.isTemporary) {
                // סטורי זמני – לא נכנס ל-Highlights
                s.isTemporary = true;
                s.category = ''; 
              } else {
                // סטורי קבוע / Highlight
                s.isTemporary = false;
                s.category = s.category || 'default';
              }
            });

            // הפרדה בין זמני לקבועים
            this.temporaryStories = stories.filter(s => s.isTemporary);
            const highlightStories = stories.filter(s => !s.isTemporary);

            // חלוקה ל-Highlights בלבד
            this.storyGroups = this.groupStoriesByCategory(highlightStories);

            // מציאת הסטורי הנוכחי (Highlight בלבד)
            const currentGroupFound = this.storyGroups.find((group, gIndex) => {
              const storyIndex = group.stories.findIndex(s => s.id === storyId);
              if (storyIndex >= 0) {
                this.currentGroupIndex = gIndex;
                this.currentStoryIndex = storyIndex;
                this.markStoryAsViewed(group.stories[storyIndex]);
                return true;
              }
              return false;
            });

            if (currentGroupFound) this.startProgress();
          },
          error: err => console.error(err)
        });
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

  get story(): Story | null {
    return this.currentGroup?.stories[this.currentStoryIndex] || null;
  }

  groupStoriesByCategory(stories: Story[]): StoryGroup[] {
    const groupsMap: { [key: string]: StoryGroup } = {};
    stories.forEach(story => {
      const userId = story.user?.userId || 'unknown';
      const key = userId + '-' + (story.category || 'default');

      if (!groupsMap[key]) {
        groupsMap[key] = {
          userId,
          category: story.category || 'default',
          stories: []
        };
      }
      if (!groupsMap[key].stories.some(s => s.id === story.id)) {
        groupsMap[key].stories.push(story);
      }
    });
    return Object.values(groupsMap);
  }

  startProgress() {
    this.progress = 0;
    clearInterval(this.progressInterval);

    if (this.story) this.markStoryAsViewed(this.story);

    const step = 100 / (this.storyDuration / 100);
    this.progressInterval = setInterval(() => {
      this.progress += step;
      if (this.progress >= 100) this.nextStatus();
    }, 100);
  }

  nextStatus() {
    if (!this.currentGroup) return;

    if (this.currentStoryIndex < this.currentGroup.stories.length - 1) {
      this.currentStoryIndex++;
      this.startProgress();
    } else if (this.currentGroupIndex < this.storyGroups.length - 1) {
      this.currentGroupIndex++;
      this.currentStoryIndex = 0;
      this.startProgress();
    } else {
      clearInterval(this.progressInterval);
      window.history.back();
    }
  }

  prevStatus() {
    if (!this.currentGroup) return;

    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.startProgress();
    } else if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.currentStoryIndex = this.currentGroup!.stories.length - 1;
      this.startProgress();
    }
  }

  toggleLike(id: string) {
    if (!this.story) return;
    this.showLikeAnimation = true;
    setTimeout(() => (this.showLikeAnimation = false), 800);

    if (this.story.likes!.includes(this.user.userId)) {
      this.story.likes = this.story.likes!.filter(uid => uid !== this.user.userId);
    } else {
      this.story.likes!.push(this.user.userId);
    }
  }

  toggleCommentBox(id: string) {
    this.commentBoxOpenFor = this.commentBoxOpenFor === id ? null : id;
  }

  sendComment(id: string) {
    if (this.newComment.trim() && this.story) {
      this.story.comments!.push({ userName: this.user.userName || '', content: this.newComment });
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
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'עכשיו';
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  }

  markStoryAsViewed(story: Story) {
    if (!story.viewedByCurrentUser) {
      story.viewedByCurrentUser = true;
      if (story.user.userId)
        this.userService.markStoryAsViewed(story.id, this.user.userId).subscribe();
    }
  }

  showTemporaryStories(userId: string) {
    const userTempStories = this.temporaryStories.filter(s => s.user.userId === userId);
    if (userTempStories.length > 0) {
      this.storyGroups = [{
        userId,
        category: 'temporary',
        stories: userTempStories
      }];
      this.currentGroupIndex = 0;
      this.currentStoryIndex = 0;
      this.startProgress();
    }
  }
}
