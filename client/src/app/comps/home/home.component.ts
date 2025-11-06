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
  this.getAllStories();
}

getAllUsers() {
  this.userService.GetAllUsers().subscribe({
    next: users => {
      this.allUsers = users.map(u => ({
  ...u,
  stories: u.stories?.map(s => {
  if (!s.user) return null; // או throw, או להתעלם
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
  // אין סטוריז? נחזיר true כדי שלא יוצג צבע
  if (!user.stories || user.stories.length === 0) return true;

  // נבדוק אם כל הסטוריז נצפו על ידי המשתמש המחובר
  const currentUserId = this.user.userId;
  return user.stories.every(story =>
    story.viewedByUserIds?.includes(currentUserId)
  );
}
checkViewedStories() {
  console.log('--- כל הסטוריז במערכת ---');

  this.allStories.forEach((story: any) => {
    // נניח שלכל סטורי יש שדה storyId, userName, viewers (מערך של userIds שצפו)
    const hasViewed = story.viewers?.includes(this.user);

    console.log(`משתמש: ${story.userName} | סטורי ID: ${story.storyId} | נצפה ע"י המשתמש המחובר: ${hasViewed ? 'כן' : 'לא'}`);

    // אם למשתמש יש כמה סטוריז – נבדוק גם אותם
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
      next: posts =>{ this.allPosts = posts,
          console.log(this.allPosts)},

      error: err => console.error('שגיאה בטעינת פוסטים:', err)
    });
  }
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
  alert('הקישור לפוסט הועתק!');

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
expandedPostIds: string[] = []; // שמירת מזהי פוסטים שנפתחו במצב "קרא עוד"

// מציג רק 5 תגובות אלא אם הפוסט במצב "קרא עוד"
getVisibleComments(post: Post) {
  if (!post.comments) return [];
  if (this.expandedPostIds.includes(post.id!)) {
    return post.comments;
  }
  return post.comments.slice(0, 5);
}

// האם יש יותר מ-5 תגובות בכלל
shouldShowReadMore(post: Post): boolean {
  return post.comments && post.comments.length > 5;
}

// פתיחה/סגירה של מצב קרא עוד
toggleReadMore(postId: string) {
  const index = this.expandedPostIds.indexOf(postId);
  if (index > -1) {
    this.expandedPostIds.splice(index, 1); // הסר כדי לסגור
  } else {
    this.expandedPostIds.push(postId); // הוסף כדי לפתוח
  }
}

}
