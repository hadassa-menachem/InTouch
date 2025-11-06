import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../classes/User';
import { map, Observable } from 'rxjs';
import { Post } from '../classes/Post';
import { Message } from '../classes/Message';
import { PostComment } from '../classes/PostComment';
import { Follow } from '../classes/Follow';
// import { Status } from '../classes/Status';
import { Like } from '../classes/Like';
import { Story } from '../classes/Story';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit{
  currentUser: User | null = null;
  MediaFilesCount:number=0;
  FollowingsCount:number=0;
  FollowersCount:number=0;
constructor(private http: HttpClient) {
  const userFromStorage = localStorage.getItem('currentUser');
    if (userFromStorage) {
      this.currentUser = JSON.parse(userFromStorage);
}}
ngOnInit(): void {
}

GetUserById(codeUser: string): Observable<User> {
  return this.http.get<User>(`https://localhost:7058/api/User/${codeUser}`);
}

AddUser(user: any): Observable<User> {
  this.currentUser = user;
 return this.http.post<User>('https://localhost:7058/api/User', user);
}

setCurrentUser(user: User) {
  this.currentUser = new User(user); // יוצרים מופע אמיתי של User
  console.log(this.currentUser);
}

getCurrentUser(): User | null {
  return this.currentUser;
}

getMediaFilesCount(user:User): number  {
  return user!.mediaFiles!.length
}

GetAllUsers(): Observable<User[]> {
 return this.http.get<User[]>(`https://localhost:7058/api/User`);
}

getAllPosts(): Observable<Post[]> {
 return this.http.get<Post[]>(`https://localhost:7058/api/Post`);
}

// ב-user.service.ts
addLike(postId: string, userId: string): Observable<Like> {
  const body = { postId, userId };
  console.log('=== DEBUG addLike ===');
  console.log('postId:', postId);
  console.log('userId:', userId);
  console.log('body being sent:', JSON.stringify(body));
  console.log('====================');
  return this.http.post<Like>('https://localhost:7058/api/Like', body);
}
deleteLike(postId: string, userId: string): Observable<void> {
  const params = new HttpParams()
    .set('postId', postId)
    .set('userId', userId);
  
  console.log('DELETE params:', params.toString());
  return this.http.delete<void>('https://localhost:7058/api/Like', { params });
}
getLikesByPostId(postId:string): Observable<Like[]>{
  return this.http.get<Like[]>(`https://localhost:7058/api/Like/post/${postId}`);
}
addPost(formData: FormData) {
  
  return this.http.post<void>('https://localhost:7058/api/Post', formData);
}
getPostsByUserId(userId: string): Observable<Post[]> {
  return this.http.get<Post[]>(`https://localhost:7058/api/Post/user/${userId}`);
}
getPostByPostId(postId:string): Observable<Post> {
  return this.http.get<Post>(`https://localhost:7058/api/Post/${postId}`);
}
logout() {
  this.currentUser = null;
  localStorage.removeItem('currentUser');
}
updateUser(id: string, formData: FormData): Observable<void> {
  return this.http.put<void>(`https://localhost:7058/api/User/${id}`, formData);
}
getChats(userId: string) {
  return this.http.get<any[]>(`https://localhost:7058/api/message/user/${userId}`);
}
sendMessage(message: Message): Observable<void> {
    return this.http.post<void>(`https://localhost:7058/api/message`, message);
  }
sendMessageWithFile(formData: FormData): Observable<void> {
  return this.http.post<void>('https://localhost:7058/api/message/send-with-file', formData);
}
followUser(follow:Follow) {
  return this.http.post('https://localhost:7058/api/follow', follow);
}

unfollowUser(followerId: string, followeeId: string) {
  return this.http.delete(`https://localhost:7058/api/follow/by-users?followerId=${followerId}&followeeId=${followeeId}`);
}

isFollowing(followerId: string, followeeId: string) {
  return this.http.get<boolean>(`https://localhost:7058/api/follow/is-following?followerId=${followerId}&followeeId=${followeeId}`);
}
// שליפת רשימת העוקבים של משתמש
getFollowers(userId: string): Observable<Follow[]> {
  return this.http.get<Follow[]>(`https://localhost:7058/api/follow/followers/${userId}`);
}

// שליפת רשימת הנעקבים (Followees) של משתמש
getFollowings(userId: string): Observable<Follow[]> {
  return this.http.get<Follow[]>(`https://localhost:7058/api/follow/followees/${userId}`);
}

 // ✅ שליפת שיחה בין שני משתמשים
  getConversation(user1Id: string, user2Id: string): Observable<Message[]> {
    return this.http.get<Message[]>(`https://localhost:7058/api/message/between/${user1Id}/${user2Id}`);
  }
getAllMessagesForUser(userId: string): Observable<Message[]> {
  return this.http.get<Message[]>(`https://localhost:7058/api/message/user/${userId}`);
}
addComment(comment:PostComment): Observable<void>{
  return this.http.post<void>(`https://localhost:7058/api/Comment`,comment)
}
getCommentsByPostId(postId: string): Observable<PostComment[]> {
  return this.http.get<PostComment[]>(`https://localhost:7058/api/Comment/post/${postId}`);
}
markMessagesAsRead(message: Message): Observable<any> {
  return this.http.post(`https://localhost:7058/api/message/mark-as-read`,message);
}
  // ✅ סימון הודעות כ"נמסרו"
  markMessagesAsDelivered(senderId: string, receiverId: string): Observable<any> {
    return this.http.post(`https://localhost:7058/api/message/mark-as-delivered`, {
      senderId,
      receiverId
    });
  }
  // ✅ סימון כל ההודעות כנמסרו למשתמש
  markAllMessagesAsDelivered(receiverId: string): Observable<any> {
    return this.http.post(`https://localhost:7058/api/message/mark-all-delivered`, {
      receiverId
    });
  }
// getStatusById(statusId: string): Observable<Status> {
//     return this.http.get<Status>(`https://localhost:7058/api/Status/${statusId}`);
// }
addStory(formData: FormData): Observable<void> {
  return this.http.post<void>('https://localhost:7058/api/Story/', formData);
}

getStoryByUserId(userId: string): Observable<Story[]> {
    return this.http.get<Story[]>(`https://localhost:7058/api/Story/user/${userId}`);
}
getStoryById(storyId: string): Observable<Story> {
    return this.http.get<Story>(`https://localhost:7058/api/Story/${storyId}`);
}
getAllStories():Observable<Story[]> {
  return this.http.get<Story[]>('https://localhost:7058/api/Story');
}
getUserCategories(userId: string): Observable<string[]> {
  return this.http.get<string[]>(`https://localhost:7058/api/Story/categories/${userId}`);
}

markStoryAsViewed(storyId: string, userId: string): Observable<any> {
    const body = { StoryId: storyId, ViewerId: userId };
  return this.http.post('https://localhost:7058/api/Story/mark-viewed', body, { responseType: 'text' });
}
getTemporaryStories(userId: string): Observable<any[]> {
  return this.http.get<any[]>(`https://localhost:7058/api/Story/temporary/${userId}`);
}

getUserHighlights(userId: string): Observable<any[]> {
  return this.http.get<any[]>(`https://localhost:7058/api/Story/highlights/${userId}`);
}

}