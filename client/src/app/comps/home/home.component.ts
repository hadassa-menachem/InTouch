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
comment: PostComment = new PostComment();
newCommentContent: string = '';
commentBoxPostId: string | null = null; // להוספת תגובה
commentsListPostId: string | null = null; // לרשימת תגובות

@ViewChildren('postElement') postElements!: QueryList<ElementRef>;
@ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
@ViewChild('messageInputRef') messageInputRef!: ElementRef;
showEmojiPicker: boolean = false;
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
      next: posts =>{ this.allPosts = posts,
          console.log(this.allPosts)},

      error: err => console.error('שגיאה בטעינת פוסטים:', err)
    });
  }

  getAllUsers() {
    this.userService.GetAllUsers().subscribe({
      next: users => this.allUsers = users,
      error: err => console.error('שגיאה בטעינת משתמשים:', err)
    });
  }

 toggleLike(postId: string, userId: string) {
  const post = this.allPosts.find(p => p.id === postId);
  if (!post) return;

  const alreadyLiked = post.likes?.some(like => like.userId === userId);

  if (alreadyLiked) {
    this.userService.deleteLike(postId, userId).subscribe({
      next: () => {
        post.likes = post.likes?.filter(like => like.userId !== userId) || [];
        this.allPosts = [...this.allPosts]; 
      },
      error: err => console.error('שגיאה בהסרת לייק:', err)
    });
  } else {
    this.userService.addLike(postId, userId).subscribe({
      next: () => {
        post.likes = [...(post.likes || []), { postId, userId } as Like];
        this.allPosts = [...this.allPosts];
      },
      error: err => console.error('שגיאה בהוספת לייק:', err)
    });
  }
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

  sharePost() {
    console.log('➤ שיתוף');
  }

  GoToUser(userId: string) {
    this.router.navigate(['/user-profile', userId]);
  }

 sendComment(postId: string) {
  if (!this.newCommentContent.trim()) return;

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
      // איפוס השדות וסגירת תיבות
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

}
