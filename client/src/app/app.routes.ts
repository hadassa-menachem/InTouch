import { Routes } from '@angular/router';
import { HomeComponent } from './comps/home/home.component';
import { ProfileComponent } from './comps/profile/profile.component';
import { PostComponent } from './comps/post/post.component';
import { SearchComponent } from './comps/search/search.component';
import { MessagesComponent } from './comps/messages/messages.component';
import { ChatComponent } from './comps/chat/chat.component';
import { CreatePostComponent } from './comps/createpost/createpost.component';
import { GroupComponent } from './comps/group/group.component';
import { NotificationsComponent } from './comps/notifications/notifications.component';
import { SignupComponent } from './comps/signup/signup.component';
import { LoginComponent } from './comps/login/login.component';
import { UserProfileComponent } from './comps/user-profile/user-profile.component';
import { AuthGuard } from './ser/auth.guard';
import { UpdateUserComponent } from './comps/update-user/update-user.component';
import { FollowersComponent } from './comps/followers/followers.component';
import { FollowingsComponent } from './comps/followings/followings.component';
import { StoryComponent } from './comps/story/story.component';
import { CreateStoryComponent } from './comps/create-story/create-story.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'post/:id', component: PostComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'createpost', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'group', component: GroupComponent, canActivate: [AuthGuard] },
  { path: 'notification', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'user-profile/:id', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'updateuser', component: UpdateUserComponent, canActivate: [AuthGuard] },
  { path: 'followers/:id', component: FollowersComponent},
{ path: 'followings/:id', component: FollowingsComponent },
  { path: 'create-story', component: CreateStoryComponent , canActivate: [AuthGuard] },
{ path: 'story/:storyId', component: StoryComponent , canActivate: [AuthGuard] },

];



