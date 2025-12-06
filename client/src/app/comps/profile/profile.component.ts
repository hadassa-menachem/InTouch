import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../lucide.module';
import { UserService } from '../../ser/user.service';
import { Post } from '../../classes/Post';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule, LucideIconsModule],
  standalone: true,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
@Injectable({ providedIn: 'root' })
export class ProfileComponent implements OnInit {
  selectedTab = 'images';
  bio: string = '';
  isEditing = false;
  user: any;
  FollowersCount: number = 0;
  FollowingCount: number = 0;
  MediaFilesCount: number = 0;
  userPosts: Post[] = [];
  imagePosts: Post[] = [];
  videoPosts: Post[] = [];

  showMessage = false;
  messageText = '';
  isSuccess = true;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public userService: UserService,
    public http: HttpClient
  ) {}

  ngOnInit(): void {
    this.user = this.userService.currentUser;
    const userId = this.user.userId;
    console.log(userId);
    if (userId) {
      this.userService.GetUserById(userId).subscribe(user => {
        this.userService.getPostsByUserId(userId).subscribe(posts => {
          this.userPosts = posts;
          this.imagePosts = this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType == 'image'));
          this.videoPosts = this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType == 'video'));
          this.MediaFilesCount = posts.length;
          console.log(this.imagePosts);
        });
        this.userService.getFollowers(this.user.userId).subscribe(arr => {
          this.FollowersCount = arr.length;
        });
        this.userService.getFollowings(this.user.userId).subscribe(arr => {
          this.FollowingCount = arr.length;
        });
      });
    }
  }

  goToPostPage(id: string) {
    this.router.navigate(['/post', id]);
  }

  GoToUser() {
    this.router.navigate(['/user-profile']);
  }

  saveChanges() {
    this.isEditing = false;
  }

  editUser() {
    this.router.navigate(['/updateuser']);
  }

  goToFollowers(userId: string) {
    this.router.navigate(['/followers', userId]);
  }

  goToFollowings(userId: string) {
    this.router.navigate(['/followings', userId]);
  }

  goToCreateStory() {
    this.router.navigate(['/create-story']);
  }

  deletePost(postId: string): void {
    if (!confirm('Are you sure you want to delete this post?')) return;
    this.userService.deletePost(postId).subscribe({
      next: () => {
        this.userPosts = this.userPosts.filter(p => p.id !== postId);
        this.MediaFilesCount = this.userPosts.length;
        console.log('Post successfully deleted');
        this.userService.getPostsByUserId(this.user.userId).subscribe(posts => {
          this.userPosts = posts;
          this.imagePosts = this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType == 'image'));
          this.videoPosts = this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType == 'video'));
          this.MediaFilesCount = posts.length;
        });
      },
      error: (err) => {
        console.error('Error deleting post:', err);
      }
    });
  }

  showFloatingMessage(text: string, success: boolean = true) {
    this.messageText = text;
    this.isSuccess = success;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  openProfileStory() {
    this.userService.getStoryByUserId(this.user.userId).subscribe({
      next: stories => {
        this.router.navigate(['/story', this.user.userId]);
      },
      error: err => console.error('Error loading temporary stories:', err)
    });
  }
}