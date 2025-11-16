import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../lucide.module';
import { UserService } from '../../ser/user.service';
import { Post } from '../../classes/Post';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule, LucideIconsModule],
  standalone: true
})
@Injectable({ providedIn: 'root' })
export class ProfileComponent implements OnInit {
  images = [
    "../assets/images/natan.jpg",
    "../assets/images/toar.jpg",
    "../assets/images/nof.jpg",
    "../assets/images/pic3.jpg",
    "../assets/images/pic4.jpg",
    "../assets/images/pic5.jpg",
  ];

  titles = [
    { title: 'weeding', image: "../assets/images/pic6.jpg" },
    { title: 'my son', image: "../assets/images/pic7.jpg" },
    { title: 'design', image: "../assets/images/pic8.jpg" },
    { title: 'food', image: "../assets/images/pic9.jpg" },
    { title: 'work', image: "../assets/images/pic10.jpg" },
    { title: 'aaa', image: "../assets/images/pic11.jpg" }
  ];

  selectedTab = 'images';
  videos = [
    '../assets/videos/video1.mp4',
    '../assets/videos/video2.mp4'
  ];

  bio: string = '';
  isEditing = false;
  user: any;
  FollowersCount: number = 0;
  FollowingCount: number = 0;
  MediaFilesCount: number = 0;
  userPosts: Post[] = [];

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
          this.MediaFilesCount = posts.length;
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

  get imagePosts(): Post[] {
    return this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType === 'image'));
  }

  get videoPosts(): Post[] {
    return this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType === 'video'));
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
    if (!confirm('את בטוחה שאת רוצה למחוק את הפוסט הזה?')) return;
    this.userService.deletePost(postId).subscribe({
      next: () => {
        this.userPosts = this.userPosts.filter(p => p.id !== postId);
        this.MediaFilesCount = this.userPosts.length;
        console.log('הפוסט נמחק בהצלחה');
      },
      error: (err) => {
        console.error('שגיאה במחיקת הפוסט:', err);
      }
    });
  }
}
