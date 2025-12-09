import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideIconsModule } from '../../lucide.module';
import { Story } from '../../classes/Story';
import { User } from '../../classes/User';
import { UserService } from '../../ser/user.service';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconsModule]
})
export class StoryComponent implements OnInit, OnDestroy {
  storiesByUser: { userId: string; stories: Story[] }[] = [];
  temporaryStories: Story[] = [];
  commentBoxOpenFor: string | null = null;
  newComment: string = '';
  showLikeAnimation: boolean = false;
  user!: User;
  currentUserStoryIndex: number = 0;
  currentUserIndex: number = 0;
  progress: number = 0;
  progressInterval: any;
  storyDuration: number = 5000;

  constructor(private userService: UserService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    console.log('userId from route:', userId); 
    if (!userId) return;
    this.user = this.userService.getCurrentUser()!;

 this.userService.getStoryByUserId(userId).subscribe({
  next: (stories: Story[]) => {

    // מוודא שכל השדות קיימים
    const validStories = stories.map(s => {
      s.likes = s.likes || [];
      s.comments = s.comments || [];
      s.viewedByUserIds = s.viewedByUserIds || [];
      s.viewedByCurrentUser = s.viewedByUserIds.includes(this.user.userId);
      return s;
    });

    // מיון לפי תאריך מהחדש לישן
    validStories.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // b לפני a => מהחדש לישן
    });

    this.userService.GetUserById(userId).subscribe(user => {
      validStories.forEach(s => (s.user = user));

      this.storiesByUser = [{
        userId,
        stories: validStories
      }];

      this.currentUserIndex = 0;
      this.currentUserStoryIndex = 0;

      if (validStories.length > 0) {
        this.markStoryAsViewed(validStories[0]);
        this.startProgress();
      }
    });
  },
  error: err => console.error(err)
});

  }

  ngOnDestroy(): void {
    clearInterval(this.progressInterval);
  }

  get currentUserStories() {
    return this.storiesByUser[this.currentUserIndex]?.stories || [];
  }

  get currentStory(): Story | null {
    return this.currentUserStories[this.currentUserStoryIndex] || null;
  }

  startProgress() {
    this.progress = 0;
    clearInterval(this.progressInterval);

    if (this.currentStory) this.markStoryAsViewed(this.currentStory);

    const step = 100 / (this.storyDuration / 100);
    this.progressInterval = setInterval(() => {
      this.progress += step;
      if (this.progress >= 100) this.nextStory();
    }, 100);
  }

  nextStory() {
    if (this.currentUserStoryIndex < this.currentUserStories.length - 1) {
      this.currentUserStoryIndex++;
      this.startProgress();
    } else if (this.currentUserIndex < this.storiesByUser.length - 1) {
      this.currentUserIndex++;
      this.currentUserStoryIndex = 0;
      this.startProgress();
    } else {
      clearInterval(this.progressInterval);
      window.history.back();
    }
  }

  prevStory() {
    if (this.currentUserStoryIndex > 0) {
      this.currentUserStoryIndex--;
      this.startProgress();
    } else if (this.currentUserIndex > 0) {
      this.currentUserIndex--;
      this.currentUserStoryIndex = this.storiesByUser[this.currentUserIndex].stories.length - 1;
      this.startProgress();
    }
  }

  toggleLike() {
    if (!this.currentStory) return;

    this.showLikeAnimation = true;
    setTimeout(() => (this.showLikeAnimation = false), 800);

    if (this.currentStory.likes!.includes(this.user.userId)) {
      this.currentStory.likes = this.currentStory.likes!.filter(uid => uid !== this.user.userId);
    } else {
      this.currentStory.likes!.push(this.user.userId);
    }
  }

  toggleCommentBox(id: string) {
    this.commentBoxOpenFor = this.commentBoxOpenFor === id ? null : id;
  }

  sendComment() {
    if (this.newComment.trim() && this.currentStory) {
      this.currentStory.comments!.push({ userName: this.user.userName || '', content: this.newComment });
      this.newComment = '';
      this.commentBoxOpenFor = null;
    }
  }

  markStoryAsViewed(story: Story) {
    if (!story.viewedByCurrentUser) {
      story.viewedByCurrentUser = true;
      this.userService.markStoryAsViewed(story.id, this.user.userId).subscribe();
    }
  }

  showTemporaryStories(userId: string) {
    const temp = this.temporaryStories.filter(s => s.user.userId === userId);
    if (temp.length > 0) {
      this.storiesByUser = [{ userId, stories: temp }];
      this.currentUserIndex = 0;
      this.currentUserStoryIndex = 0;
      this.startProgress();
    }
  }

  getTimeAgo(dateString: string | Date | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }
}
