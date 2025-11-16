import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { Post } from '../../classes/Post';
import { User } from '../../classes/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saved-post',
  templateUrl: './saved-post.component.html',
  styleUrls: ['./saved-post.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SavedPostComponent implements OnInit {
  user: User | null = null;
  savedPosts: Post[] = [];

  constructor(private userSer: UserService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.userSer.getCurrentUser();

    if (!this.user?.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.userSer.getSavedPosts(this.user.userId).subscribe({
      next: (posts: Post[]) => {
        this.savedPosts = posts || [];
        console.log(this.savedPosts);
      },
      error: (err) => console.error('❌ Error loading saved posts:', err)
    });
  }

  goToPostPage(postId: string) {
    this.router.navigate(['/post', postId]);
  }
}
