import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ViewChild, HostListener,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, LucideIconsModule, FormsModule, PickerModule, EmojiModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, AfterViewInit {
  post: Post = new Post();
  allPosts: Post[] = [];
  allUsers: User[] = [];
  user: User = new User();
  postIdToFocus: string = '';
  hasScrolled = false;
  newCommentContent: string = '';
  showLikeAnimation: boolean = false;
  savedPosts: string[] = [];
  commentBoxPostId: string | null = null;
  commentsListPostId: string | null = null;
  expandedPostIds: string[] = [];
  showEmojiPicker: boolean = false;

  @ViewChildren('postElement') postElements!: QueryList<ElementRef>;
  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public http: HttpClient
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

    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) return;

    this.postIdToFocus = postId;

    this.userService.getPostByPostId(postId).subscribe({
      next: post => {
        this.post = post;
        const postUserId = post.user?.userId;
        if (!postUserId) return;

        this.userService.getPostsByUserId(postUserId).subscribe({
          next: posts => {
            this.allPosts = posts;

            this.allPosts.forEach(p => {
              if (!p.id) return;

              this.userService.getCommentsByPostId(p.id).subscribe({
                next: comments => {
                  p.comments = comments;
                  this.allPosts = [...this.allPosts];
                },
                error: err => console.error('Error loading comments:', err)
              });

              this.userService.getLikesByPostId(p.id).subscribe({
                next: likes => {
                  p.likes = likes;
                  this.allPosts = [...this.allPosts];
                },
                error: err => console.error('Error loading likes:', err)
              });
            });
          },
          error: err => console.error('Error loading user posts:', err)
        });
      },
      error: err => console.error('Error loading post:', err)
    });

    this.loadSavedPosts();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.hasScrolled && this.postIdToFocus) {
        const el = this.postElements.find(p =>
          p.nativeElement.getAttribute('id') === this.postIdToFocus
        );
        if (el) {
          el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.hasScrolled = true;
        }
      }
    }, 100);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  GoToUser(userId: string) {
    this.router.navigate(['/user-profile', userId]);
  }

  playVideo(event: Event) {
    (event.target as HTMLVideoElement).play();
  }

  pauseVideo(event: Event) {
    (event.target as HTMLVideoElement).pause();
  }

  toggleLike(postId: string, userId: string) {
    const post = this.allPosts.find(p => p.id === postId);
    if (!post) return;

    const alreadyLiked = post.likes?.some(like => like.userId === userId);

    if (alreadyLiked) {
      post.likes = post.likes?.filter(like => like.userId !== userId) || [];
      this.allPosts = [...this.allPosts];

      this.userService.deleteLike(postId, userId).subscribe({
        next: () => this.refreshPostLikes(postId),
        error: () => {
          post.likes.push({ postId, userId } as Like);
          this.allPosts = [...this.allPosts];
        }
      });
    } else {
      if (!post.likes) post.likes = [];
      post.likes.push({ postId, userId } as Like);
      this.allPosts = [...this.allPosts];

      this.userService.addLike(postId, userId).subscribe({
        next: () => this.refreshPostLikes(postId),
        error: () => {
          post.likes = post.likes?.filter(like => like.userId !== userId) || [];
          this.allPosts = [...this.allPosts];
        }
      });
    }
  }

  refreshPostLikes(postId: string) {
    this.userService.getLikesByPostId(postId).subscribe({
      next: likes => {
        const post = this.allPosts.find(p => p.id === postId);
        if (post) {
          post.likes = likes;
          this.allPosts = [...this.allPosts];
        }
      },
      error: err => console.error('Error refreshing likes:', err)
    });
  }

  isPostLiked(post: Post): boolean {
    return post.likes?.some(like => like.userId === this.user.userId) || false;
  }

  toggleCommentBox(postId: string): void {
    this.commentBoxPostId = this.commentBoxPostId === postId ? null : postId;
  }

  toggleCommentsList(postId: string): void {
    if (this.commentsListPostId === postId) {
      this.commentsListPostId = null;
    } else {
      this.commentsListPostId = postId;

      this.userService.getCommentsByPostId(postId).subscribe({
        next: comments => {
          const index = this.allPosts.findIndex(p => p.id === postId);
          if (index !== -1) this.allPosts[index].comments = comments;
        },
        error: err => console.error('Error loading comments:', err)
      });
    }
  }

  sendComment(postId: string) {
    if (!this.newCommentContent.trim()) return;

    const newComment = new PostComment({
      postId,
      userId: this.user.userId,
      userName: `${this.user.firstName} ${this.user.lastName}`,
      content: this.newCommentContent.trim()
    });

    this.userService.addComment(newComment).subscribe({
      next: response => {
        const index = this.allPosts.findIndex(p => p.id === postId);
        if (index !== -1) {
          const commentForUI = new PostComment({
            id: response.id || response.Id,
            postId,
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
      error: err => console.error('Error sending response:', err)
    });
  }

  getVisibleComments(post: Post) {
    if (!post.comments) return [];
    return this.expandedPostIds.includes(post.id!) ? post.comments : post.comments.slice(0, 5);
  }

  shouldShowReadMore(post: Post): boolean {
    return (post.comments?.length || 0) > 5;
  }

  toggleReadMore(postId: string) {
    const index = this.expandedPostIds.indexOf(postId);
    if (index > -1) this.expandedPostIds.splice(index, 1);
    else this.expandedPostIds.push(postId);
  }

@HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.emojiPickerRef?.nativeElement?.contains(event.target);
    const clickedButton = (event.target as HTMLElement)?.closest('.emoji-button-wrapper');

    if (!clickedInside && !clickedButton) {
      this.showEmojiPicker = false;
    }
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
    setTimeout(() => this.messageInputRef?.nativeElement?.focus(), 0);
  }

  addEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native;
    if (emoji) this.newCommentContent += emoji;
  }

  loadSavedPosts() {
    this.userService.getSavedPosts(this.user.userId).subscribe({
      next: posts => this.savedPosts = posts.map(p => p.id!),
      error: err => console.error('Error loading saved posts:', err)
    });
  }

  isPostSaved(post: Post): boolean {
    return this.savedPosts.includes(post.id!);
  }

  toggleSavePost(postId: string) {
    const isSaved = this.savedPosts.includes(postId);

    if (isSaved) {
      this.savedPosts = this.savedPosts.filter(id => id !== postId);
      this.userService.unsavePost(this.user.userId, postId).subscribe({
        next: () => {},
        error: () => this.savedPosts.push(postId)
      });
    } else {
      this.savedPosts.push(postId);
      this.userService.savePost(this.user.userId, postId).subscribe({
        next: () => {},
        error: () => this.savedPosts = this.savedPosts.filter(id => id !== postId)
      });
    }
  }
}