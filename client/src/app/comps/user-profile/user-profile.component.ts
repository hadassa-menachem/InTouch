import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../ser/user.service';
import { Post } from '../../classes/Post';
import { User } from '../../classes/User';
import { ActivatedRoute } from '@angular/router';
import { Follow } from '../../classes/Follow';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  standalone:true
})
export class UserProfileComponent implements OnInit{

    titles=[
      {title:'weeding', image: "../assets/images/pic6.jpg"}, 
      {title:'my son',image: "../assets/images/pic7.jpg"}, 
      {title:'design', image: "../assets/images/pic8.jpg"},
      {title:'food',image: "../assets/images/pic9.jpg"},
      {title:'work', image: "../assets/images/pic10.jpg"},
      {title:'aaa', image: "../assets/images/pic11.jpg"}];
  selectedTab = 'images';

 constructor(
  private router: Router,
  private route: ActivatedRoute,
  private userService: UserService,
 public http: HttpClient,

) {}
  user: any;
  profileUser:User=new User()
  userPosts: Post[] = [];
  FollowersCount:number=0;
  FollowingCount:number=0;
  MediaFilesCount:number=0;
  allFollowings:Follow[]=[];
  allFollowers:Follow[]=[];
  isFollowing:boolean=false;
  follow!: Follow;
  storys: any[] = [];

  ngOnInit(): void {
  this.user = this.userService.currentUser;
  const userId = this.route.snapshot.paramMap.get('id');

  if (userId) {
    this.userService.GetUserById(userId).subscribe(userData => {
      this.profileUser = userData;

      // ✅ אחרי שהפרופיל נטען, משוך גם את הסטוריז
      this.userService.getStoryByUserId(this.profileUser.userId).subscribe(storys => {
          this.storys = storys;
          console.log('Loaded stories:', this.storys);
      });

      this.userService.isFollowing(this.user.userId, this.profileUser.userId)
        .subscribe(result => { this.isFollowing = result; });

      this.userService.getPostsByUserId(userId).subscribe(posts => {
        this.userPosts = posts;
        this.MediaFilesCount = posts.length;
      });

      this.userService.getFollowers(this.profileUser.userId).subscribe(arr => { this.FollowersCount = arr.length; });
      this.userService.getFollowings(this.profileUser.userId).subscribe(arr => { this.FollowingCount = arr.length; });
    });
  }
}

   getAllFollowers() {
    this.userService.getFollowers(this.profileUser.userId).subscribe({
      next: Followers =>{ this.allFollowers = Followers,
          console.log(this.allFollowers)},

      error: err => console.error('שגיאה בטעינת עוקבים:', err)
    });
  }
  getAllFollowings() {
    this.userService.getFollowings(this.profileUser.userId).subscribe({
      next: Followings =>{ this.allFollowings = Followings,
          console.log(this.allFollowings)},

      error: err => console.error('שגיאה בטעינת עוקבים:', err)
    });
  }
goToPostPage(id: string) {
  this.router.navigate(['/post',id]); 
}

toggleFollow() {
  if (!this.profileUser?.userId || !this.user?.userId) return;

  if (this.isFollowing) {
    this.userService.unfollowUser(this.userService.currentUser!.userId, this.profileUser.userId).subscribe({
      next: () => {
        console.log('Unfollow successful');
        this.isFollowing = false;
        this.FollowersCount--;
      },
      error: (err) => {
        console.log('Error unfollowing:', err);
      }
    });
  } 
  else {
  this.follow = new Follow({
  followerId: this.user.userId,
  followeeId: this.profileUser.userId
});


console.log('Sending follow:', this.follow);
    this.userService.followUser(this.follow).subscribe({
      next: () => {
        console.log('Follow successful');
        this.isFollowing = true;
        this.FollowersCount++;
      },
      error: (err) => {
        console.log('Error following:', err);
      }
    });
  }
}

get imagePosts(): Post[] {
  return this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType === 'image'));
}

get videoPosts(): Post[] {
  return this.userPosts.filter(p => p.mediaFiles.some(m => m.mediaType === 'video'));
}
goToFollowers(userId: string) {
  this.router.navigate(['/followers', userId]);
}

goToFollowings(userId: string) {
  this.router.navigate(['/followings', userId]);
}
openProfileImage(imageUrl: string) {
  window.open(imageUrl, '_blank'); 
}
openStatus() {
  console.log(this.profileUser.userId)
  this.router.navigate(['/status', this.profileUser.userId]);
}
 openStory(storyId: string) {
  this.router.navigate(['/story', storyId]);
} 
}
