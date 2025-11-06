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
  comment: PostComment = new PostComment();
  showLikeAnimation: boolean = false;

  commentBoxPostId: string | null = null;
  commentsListPostId: string | null = null;
  @ViewChildren('postElement') postElements!: QueryList<ElementRef>;
  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;
  showEmojiPicker: boolean = false;

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
                  this.allPosts = [...this.allPosts]; // ✅ עדכון רפרנס
                },
                error: err => console.error('שגיאה בטעינת תגובות:', err)
              });

              this.userService.getLikesByPostId(p.id).subscribe({
                next: likes => {
                  p.likes = likes;
                  this.allPosts = [...this.allPosts]; // ✅ עדכון רפרנס
                },
                error: err => console.error('שגיאה בטעינת לייקים:', err)
              });
            });
          },
          error: err => console.error('שגיאה בטעינת פוסטים של המשתמש:', err)
        });
      },
      error: err => console.error('שגיאה בטעינת הפוסט:', err)
    });
  }

  getAllUsers() {
    this.userService.GetAllUsers().subscribe({
      next: users => this.allUsers = users,
      error: err => console.error('שגיאה בטעינת משתמשים:', err)
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.hasScrolled && this.postIdToFocus) {
        const el = this.postElements.find(p =>
          p.nativeElement.getAttribute('id') === this.postIdToFocus
        );
        console.log('scrollToFocusedPost', this.postIdToFocus, el);
        if (el) {
          el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.hasScrolled = true;
        }
      }
    }, 100);
  }

  commentPost() {
    console.log('💬 תגובה');
  }

  sharePost() {
    console.log('➤ שיתוף');
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  GoToUser(userId: string) {
    this.router.navigate(['/user-profile', userId]);
  }

  playVideo(event: Event) {
    const video = event.target as HTMLVideoElement;
    video.play();
  }

  pauseVideo(event: Event) {
    const video = event.target as HTMLVideoElement;
    video.pause();
  }

  commentPostId: string | null = null;

toggleLike(postId: string, userId: string) {
  const post = this.allPosts.find(p => p.id === postId);
  if (!post) {
    console.error('Post not found!');
    return;
  }

  const alreadyLiked = post.likes?.some(like => like.userId === userId);
  console.log(`Post ${postId} - Already liked: ${alreadyLiked}`);

  if (alreadyLiked) {
    // 🔴 מחיקת לייק
    console.log('Removing like...');
    
    // ✅ 1. עדכן מיד את ה-UI (אופטימיסטי)
    post.likes = post.likes?.filter(like => like.userId !== userId) || [];
    this.allPosts = [...this.allPosts];
    
    // ✅ 2. שלח לשרת
    this.userService.deleteLike(postId, userId).subscribe({
      next: () => {
        console.log('✅ Like removed from server');
        // ✅ 3. רענן מהשרת לוודא סנכרון
        this.refreshPostLikes(postId);
      },
      error: err => {
        console.error('❌ Error removing like:', err);
        // ✅ 4. אם נכשל, החזר את הלייק
        if (!post.likes) post.likes = [];
        post.likes.push({ postId, userId } as Like);
        this.allPosts = [...this.allPosts];
      }
    });
  } else {
    // 🟢 הוספת לייק
    console.log('Adding like...');
    
    // ✅ 1. עדכן מיד את ה-UI (אופטימיסטי)
    if (!post.likes) post.likes = [];
    post.likes.push({ postId, userId } as Like);
    this.allPosts = [...this.allPosts];
    
    // ✅ 2. שלח לשרת
    this.userService.addLike(postId, userId).subscribe({
      next: (returnedLike) => {
        console.log('✅ Like added to server', returnedLike);
        // ✅ 3. רענן מהשרת לוודא סנכרון
        this.refreshPostLikes(postId);
      },
      error: err => {
        console.error('❌ Error adding like:', err);
        // ✅ 4. אם נכשל, הסר את הלייק
        post.likes = post.likes?.filter(like => like.userId !== userId) || [];
        this.allPosts = [...this.allPosts];
      }
    });
  }
}

// ✅ פונקציה לרענון לייקים
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
    error: err => {
      console.error('❌ Error refreshing likes:', err);
      // ✅ אם הרענון נכשל, זה לא קריטי - ה-UI כבר מעודכן
    }
  });
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
          if (index !== -1) {
            this.allPosts[index].comments = comments;
          }
        },
        error: err => {
          console.error('שגיאה בטעינת תגובות:', err);
        }
      });
    }
  }

  isPostLiked(post: Post): boolean {
    return post.likes?.some(like => like.userId === this.user.userId);
  }

  sendComment(postId: string) {
    if (!this.newCommentContent.trim()) {
      alert("לא מזההה יוזר");
      return;
    }
    if (!this.user?.userId) {
      return;
    }

    this.comment.postId = postId;
    this.comment.userId = this.user.userId;
    this.comment.content = this.newCommentContent.trim();

    this.userService.addComment(this.comment).subscribe({
      next: () => {
        const index = this.allPosts.findIndex(p => p.id === postId);
        if (index !== -1) {
          const newComment = {
            userName: this.user.firstName + ' ' + this.user.lastName,
            content: this.comment.content
          };
          this.allPosts[index].comments?.push(newComment as PostComment);
          this.allPosts = [...this.allPosts];
        }

        this.newCommentContent = '';
        this.commentBoxPostId = null;
        this.commentsListPostId = null;
        this.showEmojiPicker = false;
      },
      error: err => {
        console.error('שגיאה בשליחת תגובה:', err);
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

  expandedPostIds: string[] = [];

  getVisibleComments(post: Post) {
    if (!post.comments) return [];
    if (this.expandedPostIds.includes(post.id!)) {
      return post.comments;
    }
    return post.comments.slice(0, 5);
  }

  shouldShowReadMore(post: Post): boolean {
    return post.comments && post.comments.length > 5;
  }

  toggleReadMore(postId: string) {
    const index = this.expandedPostIds.indexOf(postId);
    if (index > -1) {
      this.expandedPostIds.splice(index, 1);
    } else {
      this.expandedPostIds.push(postId);
    }
  }
}