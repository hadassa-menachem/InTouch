import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../lucide.module';
import { UserService } from '../../ser/user.service';
import { Post } from '../../classes/Post';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

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
        ]),
        trigger('fadeOutIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
            ])
        ]),
        trigger('postAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)', height: '0px' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)', height: '*' }))
        ]),
       transition(':leave', [
       animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.95)', height: '0px' }))
     ])
   ])]
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

    showDeleteModal = false;
    postToDelete: Post | null = null;

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

    confirmDeletePost(post: Post) {
        this.postToDelete = post;
        this.showDeleteModal = true;
    }

    cancelDelete() {
        this.showDeleteModal = false;
        this.postToDelete = null;
    }

    performDelete() {
        if (!this.postToDelete) return;

        this.userService.deletePost(this.postToDelete.id!).subscribe({
            next: () => {
                this.userPosts = this.userPosts.filter(p => p.id !== this.postToDelete!.id);
                this.MediaFilesCount = this.userPosts.length;
                this.showFloatingMessage('The post was successfully deleted!', true);
                this.showDeleteModal = false;
                this.postToDelete = null;

                this.userService.getPostsByUserId(this.user.userId).subscribe(posts => {
                    this.userPosts = posts;
                    this.imagePosts = this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType == 'image'));
                    this.videoPosts = this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType == 'video'));
                    this.MediaFilesCount = posts.length;
                    console.log(this.imagePosts);
                });
            },
            error: (err) => {
                this.showFloatingMessage('Error deleting post', false);
                this.showDeleteModal = false;
                this.postToDelete = null;
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
