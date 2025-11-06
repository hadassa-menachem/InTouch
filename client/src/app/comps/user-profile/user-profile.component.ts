import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../ser/user.service';
import { Post } from '../../classes/Post';
import { User } from '../../classes/User';
import { Follow } from '../../classes/Follow';
import { LucideIconsModule } from '../../lucide.module';
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule,LucideIconsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  profileUser: User = new User();
  user: User | null = null;
  userPosts: Post[] = [];
  FollowersCount: number = 0;
  FollowingCount: number = 0;
  MediaFilesCount: number = 0;
  allFollowers: Follow[] = [];
  allFollowings: Follow[] = [];
  isFollowing: boolean = false;
  follow!: Follow;
  storys: any[] = [];
  selectedTab: string = 'images';
highlights: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.user = this.userService.currentUser;
    const userId = this.route.snapshot.paramMap.get('id');

    if (!userId) return;

    // ✅ שליפה של המשתמש הנצפה
    this.userService.GetUserById(userId).subscribe({
      next: userData => {
        this.profileUser = userData;
        this.loadCountsAndPosts();
        this.loadHighlights();
        this.checkIfFollowing();
      },
      error: err => console.error('שגיאה בטעינת משתמש:', err)
    });
  }

  // ✅ טוען את הפוסטים והסטטיסטיקות
  loadCountsAndPosts() {
    this.userService.getFollowers(this.profileUser.userId).subscribe(arr => this.FollowersCount = arr.length);
    this.userService.getFollowings(this.profileUser.userId).subscribe(arr => this.FollowingCount = arr.length);
    this.userService.getPostsByUserId(this.profileUser.userId).subscribe(posts => {
      this.userPosts = posts;
      this.MediaFilesCount = posts.length;
    });
  }

  // ✅ טוען רק היילייטס (סטוריז קבועים)
  loadHighlights() {
  this.userService.getUserHighlights(this.profileUser.userId).subscribe({
    next: highlights => {
      this.highlights = Array.isArray(highlights)
        ? highlights
        : Object.values(highlights || {}).flat();
      console.log('Highlights loaded:', this.highlights);
    },
    error: err => console.error('שגיאה בטעינת Highlights:', err)
  });
}
// ✅ פתיחת סטורי זמני (שמוצג רק ל-24 שעות)
openProfileStory() {
  this.userService.getTemporaryStories(this.profileUser.userId).subscribe({
    next: stories => {
      if (stories && stories.length > 0) {
        this.router.navigate(['/story', this.profileUser.userId]);
      } else {
        alert('אין סטוריז זמניים להצגה.');
      }
    },
    error: err => console.error('שגיאה בטעינת סטוריז זמניים:', err)
  });
}


  // ✅ בדיקה אם המשתמש הנוכחי כבר עוקב
  checkIfFollowing() {
    if (!this.user?.userId || !this.profileUser?.userId) return;

    this.userService.getFollowers(this.profileUser.userId).subscribe(followers => {
      this.isFollowing = followers.some(f => f.followerId === this.user!.userId);
    });
  }

selectedImageUrl: string | null = null;

openProfileImage(imageUrl?: string | null) {
  if (imageUrl) {
    this.selectedImageUrl = imageUrl;
  }
}

closeImageView() {
  this.selectedImageUrl = null;
}

  // ✅ פתיחת סטורי לפי מזהה
  openStory(storyId: string) {
    if (storyId) this.router.navigate(['/story', storyId]);
  }

  // ✅ ניתוב לעמוד פוסט
  goToPostPage(id: string) {
    this.router.navigate(['/post', id]);
  }

  // ✅ מעבר לעמוד עוקבים / נעקבים
  goToFollowers(userId: string) {
    this.router.navigate(['/followers', userId]);
  }

  goToFollowings(userId: string) {
    this.router.navigate(['/followings', userId]);
  }

  // ✅ ניהול מעקב
  toggleFollow() {
    if (!this.user?.userId || !this.profileUser?.userId) return;

    if (this.isFollowing) {
      this.userService.unfollowUser(this.user.userId, this.profileUser.userId).subscribe({
        next: () => {
          this.isFollowing = false;
          this.FollowersCount--;
        },
        error: err => console.error('שגיאה בביטול מעקב:', err)
      });
    } else {
      const newFollow = new Follow({
        followerId: this.user.userId,
        followeeId: this.profileUser.userId
      });

      this.userService.followUser(newFollow).subscribe({
        next: () => {
          this.isFollowing = true;
          this.FollowersCount++;
        },
        error: err => console.error('שגיאה במעקב:', err)
      });
    }
  }

  // ✅ סינון תמונות ווידאו
  get imagePosts(): Post[] {
    return this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType === 'image'));
  }

  get videoPosts(): Post[] {
    return this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType === 'video'));
  }
  openChat(){
  
      // אם אין הודעות, ניצור "צאט חדש"
        this.router.navigate(['/chat', this.profileUser.userId]);
    
  }
}
