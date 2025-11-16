import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from '../../lucide.module';
import { Post } from '../../classes/Post';
import { User } from '../../classes/User';
import { Like } from '../../classes/Like';
import { UserService } from '../../ser/user.service';
import { PostComment } from '../../classes/PostComment';
import { FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { Story } from '../../classes/Story';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideIconsModule, FormsModule, PickerModule, EmojiModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  user: User = new User();
  allPosts: Post[] = [];
  allUsers: User[] = [];
  allStories: Story[] = [];
  newCommentContent: string = '';
  commentBoxPostId: string | null = null;
  commentsListPostId: string | null = null;
  showEmojiPicker: boolean = false;
  expandedPostIds: string[] = [];
  savedPosts: string[] = [];

  @ViewChildren('postElement') postElements!: QueryList<ElementRef>;
  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userFromStorage = localStorage.getItem('currentUser');
    if (userFromStorage) {
      this.user = JSON.parse(userFromStorage);
      this.userService.currentUser = this.user;
    } else {
      this.router.navigate(['/login']);
      return;
    }
    this.getAllPosts();
    this.getAllUsers();
    this.getAllStories();
  }

  getAllUsers() {
    this.userService.GetAllUsers().subscribe({
      next: users => {
        this.allUsers = users.map(u => ({
          ...u,
          stories: u.stories?.map(s => {
            if (!s.user) return null;
            return {
              id: s.id,
              user: {
                userId: s.user.userId,
                firstName: s.user.firstName,
                lastName: s.user.lastName,
                profilePicUrl: s.user.profilePicUrl
              },
              content: s.content,
              imageUrl: s.imageUrl,
              category: s.category,
              createdAt: new Date(s.createdAt),
              viewedByUserIds: s.viewedByUserIds || [],
              viewedByCurrentUser: s.viewedByUserIds?.includes(this.user.userId) || false
            };
          }).filter(s => s !== null) || []
        })) as User[];
        console.log(this.allUsers);
      },
      error: err => console.error('שגיאה בטעינת משתמשים:', err)
    });
  }

  hasViewedStory(user: User): boolean {
    if (!user.stories || user.stories.length === 0) return true;
    const currentUserId = this.user.userId;
    return user.stories.every(story =>
      story.viewedByUserIds?.includes(currentUserId)
    );
  }

  checkViewedStories() {
    console.log('--- כל הסטוריז במערכת ---');
    this.allStories.forEach((story: any) => {
      const hasViewed = story.viewers?.includes(this.user);
      console.log(`משתמש: ${story.userName} | סטורי ID: ${story.storyId} | נצפה ע"י המשתמש המחובר: ${hasViewed ? 'כן' : 'לא'}`);
      if (story.stories && story.stories.length > 0) {
        story.stories.forEach((s: any) => {
          const viewed = s.viewers?.includes(this.user);
          console.log(`   ↳ סטורי משנה ID: ${s.storyId} | נצפה: ${viewed ? 'כן' : 'לא'}`);
        });
      }
    });
    console.log('--------------------------');
  }

  getAllStories() {
    this.userService.getAllStories().subscribe({
      next: (stories) => {
        this.allStories = stories;
        this.checkViewedStories();
      },
      error: (err) => console.error(err)
    });
  }

  ngAfterViewInit(): void {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.emojiPickerRef?.nativeElement?.contains(event.target);
    const clickedButton = (event.target as HTMLElement)?.closest('.emoji-button-wrapper');
    if (!clickedInside && !clickedButton) {
      this.showEmojiPicker = false;
    }
  }

  getAllPosts() {
    this.userService.getAllPosts().subscribe({
      next: posts => {
        this.allPosts = posts;
        console.log(this.allPosts);
      },
      error: err => console.error('שגיאה בטעינת פוסטים:', err)
    });
  }

  toggleLike(post: Post) {
    const liked = this.isPostLiked(post);
    if (liked) {
      this.userService.deleteLike(post.id!, this.user.userId).subscribe({
        next: () => {
          post!.likes = post!.likes?.filter(like => like.userId !== this.user.userId) || [];
          this.allPosts = [...this.allPosts];
          console.log(`❌ Like removed from post ${post.id}`);
        },
        error: err => console.error('Error removing like:', err)
      });
    } else {
      this.userService.addLike(post.id!, this.user.userId).subscribe({
        next: () => {
          if (!post!.likes) post!.likes = [];
          post!.likes.push({ userId: this.user.userId } as Like);
          this.allPosts = [...this.allPosts];
          console.log(`✅ Like added to post ${post.id}`);
        },
        error: err => console.error('Error adding like:', err)
      });
    }
  }

  refreshPostLikes(postId: string) {
    this.userService.getLikesByPostId(postId).subscribe({
      next: (likes) => {
        const post = this.allPosts.find(p => p.id === postId);
        if (post) {
          post.likes = likes;
          console.log(`✅ Refreshed: ${likes.length} likes`);
          this.allPosts = [...this.allPosts];
        }
      },
      error: err => console.error('❌ Error refreshing likes:', err)
    });
  }

  toggleCommentBox(postId: string): void {
    this.commentBoxPostId = this.commentBoxPostId === postId ? null : postId;
  }

  toggleCommentsList(postId: string): void {
    this.commentsListPostId = this.commentsListPostId === postId ? null : postId;
  }

  isPostLiked(post: Post): boolean {
    return post.likes?.some(like => like.userId === this.user.userId);
  }

  playVideo(event: Event) {
    const video = event.target as HTMLVideoElement;
    video.play().catch(err => console.log('בעיה בניגון וידאו:', err));
  }

  pauseVideo(event: Event) {
    const video = event.target as HTMLVideoElement;
    video.pause();
  }

  sharePost(postId: string) {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
  }

  GoToUser(userId: string) {
    this.router.navigate(['/user-profile', userId]);
  }

  sendComment(postId: string) {
    if (!this.newCommentContent.trim()) return;

    const newComment = new PostComment({
      postId: postId,
      userId: this.user.userId,
      userName: `${this.user.firstName} ${this.user.lastName}`,
      content: this.newCommentContent.trim()
    });

    this.userService.addComment(newComment).subscribe({
      next: (response) => {
        const index = this.allPosts.findIndex(p => p.id === postId);
        if (index !== -1) {
          const commentForUI = new PostComment({
            id: response.id || response.Id,
            postId: postId,
            userId: this.user.userId,
            userName: `${this.user.firstName} ${this.user.lastName}`,
            content: newComment.content,
            createdAt: response.createdAt || new Date()
          });

          if (!this.allPosts[index].comments) this.allPosts[index].comments = [];
          this.allPosts[index].comments.push(commentForUI);
          this.allPosts = [...this.allPosts];
        }

        this.newCommentContent = '';
        this.commentBoxPostId = null;
        this.commentsListPostId = null;
        this.showEmojiPicker = false;
      },
      error: err => {
        console.error('❌ שגיאה בשליחת תגובה:', err);
        if (err.error && err.error.errors) {
          Object.keys(err.error.errors).forEach(key => {
            console.error(`   - ${key}:`, err.error.errors[key]);
          });
        }
      }
    });
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
    console.log('Emoji Picker toggled! סטטוס:', this.showEmojiPicker);
  }

  addEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native;
    if (emoji) {
      this.newCommentContent += emoji;
      setTimeout(() => {
        this.messageInputRef?.nativeElement?.focus();
      }, 0);
    }
  }

  getVisibleComments(post: Post) {
    if (!post.comments) return [];
    if (this.expandedPostIds.includes(post.id!)) return post.comments;
    return post.comments.slice(0, 5);
  }

  shouldShowReadMore(post: Post): boolean {
    return post.comments && post.comments.length > 5;
  }

  toggleReadMore(postId: string) {
    const index = this.expandedPostIds.indexOf(postId);
    if (index > -1) this.expandedPostIds.splice(index, 1);
    else this.expandedPostIds.push(postId);
  }

  isPostSaved(post: any): boolean {
    return this.savedPosts.includes(post.id);
  }

  toggleSavePost(postId: string) {
    const isSaved = this.savedPosts.includes(postId);

    if (isSaved) {
      this.savedPosts = this.savedPosts.filter(id => id !== postId);
      this.savedPosts = [...this.savedPosts];
      this.userService.unsavePost(this.user.userId, postId).subscribe({
        next: () => console.log('Post unsaved successfully'),
        error: () => {
          this.savedPosts = [...this.savedPosts, postId];
        }
      });
    } else {
      this.savedPosts = [...this.savedPosts, postId];
      this.userService.savePost(this.user.userId, postId).subscribe({
        next: () => console.log('Post saved successfully'),
        error: () => {
          this.savedPosts = this.savedPosts.filter(id => id !== postId);
          this.savedPosts = [...this.savedPosts];
        }
      });
    }
  }
}
