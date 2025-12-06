import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../classes/User';
import { Post } from '../classes/Post';
import { Message } from '../classes/Message';
import { PostComment } from '../classes/PostComment';
import { Follow } from '../classes/Follow';
import { Like } from '../classes/Like';
import { Story } from '../classes/Story';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  currentUser: User | null = null;
  MediaFilesCount: number = 0;
  FollowingsCount: number = 0;
  FollowersCount: number = 0;
  private apiUrl = 'https://localhost:7058/api/SavedPost';

  constructor(private http: HttpClient) {
    const userFromStorage = localStorage.getItem('currentUser');
    if (userFromStorage) {
      this.currentUser = JSON.parse(userFromStorage);
    }
  }

  ngOnInit(): void {}

  // User management
  GetUserById(codeUser: string): Observable<User> {
    return this.http.get<User>(`https://localhost:7058/api/User/${codeUser}`);
  }

  AddUser(user: any): Observable<User> {
    this.currentUser = user;
    return this.http.post<User>('https://localhost:7058/api/User', user);
  }

  setCurrentUser(user: User) {
    this.currentUser = new User(user);
    console.log(this.currentUser);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateUser(id: string, formData: FormData): Observable<void> {
    return this.http.put<void>(`https://localhost:7058/api/User/${id}`, formData);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  GetAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`https://localhost:7058/api/User`);
  }

  getMediaFilesCount(user: User): number {
    return user!.mediaFiles!.length;
  }

  // Posts
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`https://localhost:7058/api/Post`);
  }

  addPost(formData: FormData) {
    return this.http.post<void>('https://localhost:7058/api/Post', formData);
  }

  getPostsByUserId(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`https://localhost:7058/api/Post/user/${userId}`);
  }

  getPostByPostId(postId: string): Observable<Post> {
    return this.http.get<Post>(`https://localhost:7058/api/Post/${postId}`);
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`https://localhost:7058/api/Post/${id}`);
  }

  // Likes
  addLike(postId: string, userId: string): Observable<void> {
    const body = { postId, userId };
    return this.http.post<void>('https://localhost:7058/api/Like', body);
  }

  deleteLike(postId: string, userId: string): Observable<void> {
    const params = new HttpParams()
      .set('postId', postId)
      .set('userId', userId);
    console.log('DELETE params:', params.toString());
    return this.http.delete<void>('https://localhost:7058/api/Like', { params });
  }

  getLikesByPostId(postId: string): Observable<Like[]> {
    return this.http.get<Like[]>(`https://localhost:7058/api/Like/post/${postId}`);
  }

  // Comments
  addComment(comment: PostComment): Observable<any> {
    return this.http.post<any>('https://localhost:7058/api/Comment', comment);
  }

  getCommentsByPostId(postId: string): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`https://localhost:7058/api/Comment/post/${postId}`);
  }

  // Follow management
  followUser(follow: Follow) {
    return this.http.post('https://localhost:7058/api/follow', follow);
  }

  unfollowUser(followerId: string, followeeId: string) {
    return this.http.delete(`https://localhost:7058/api/follow/by-users?followerId=${followerId}&followeeId=${followeeId}`);
  }

  isFollowing(followerId: string, followeeId: string) {
    return this.http.get<boolean>(`https://localhost:7058/api/follow/is-following?followerId=${followerId}&followeeId=${followeeId}`);
  }

  getFollowers(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`https://localhost:7058/api/follow/followers/${userId}`);
  }

  getFollowings(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`https://localhost:7058/api/follow/followees/${userId}`);
  }

  // Messaging
  getChats(userId: string) {
    return this.http.get<any[]>(`https://localhost:7058/api/message/user/${userId}`);
  }

  getConversation(user1Id: string, user2Id: string): Observable<Message[]> {
    return this.http.get<Message[]>(`https://localhost:7058/api/message/between/${user1Id}/${user2Id}`);
  }

  getAllMessagesForUser(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`https://localhost:7058/api/message/user/${userId}`);
  }

  sendMessage(message: Message): Observable<void> {
    return this.http.post<void>(`https://localhost:7058/api/message`, message);
  }

  sendMessageWithFile(formData: FormData): Observable<void> {
    return this.http.post<void>('https://localhost:7058/api/message/send-with-file', formData);
  }

  markMessagesAsRead(message: Message): Observable<any> {
    return this.http.post(`https://localhost:7058/api/message/mark-as-read`, message);
  }

  markMessagesAsDelivered(senderId: string, receiverId: string): Observable<any> {
    return this.http.post(`https://localhost:7058/api/message/mark-as-delivered`, { senderId, receiverId });
  }

  markAllMessagesAsDelivered(receiverId: string): Observable<any> {
    return this.http.post(`https://localhost:7058/api/message/mark-all-delivered`, { receiverId });
  }

  // Stories
  addStory(formData: FormData): Observable<any> {
  return this.http.post('https://localhost:7058/api/Story/', formData, {
    responseType: 'text' // זה אומר ל-Angular לא לנסות לפרסר את התשובה כ-JSON
  });
}

  getStoryByUserId(userId: string): Observable<Story[]> {
    return this.http.get<Story[]>(`https://localhost:7058/api/Story/user/${userId}`);
  }

  getStoryById(storyId: string): Observable<Story> {
    return this.http.get<Story>(`https://localhost:7058/api/Story/${storyId}`);
  }

  getAllStories(): Observable<Story[]> {
    return this.http.get<Story[]>('https://localhost:7058/api/Story');
  }

  getUserCategories(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`https://localhost:7058/api/Story/categories/${userId}`);
  }

  markStoryAsViewed(storyId: string, userId: string): Observable<any> {
    const body = { StoryId: storyId, ViewerId: userId };
    return this.http.post('https://localhost:7058/api/Story/mark-viewed', body, { responseType: 'text' });
  }


  // Saved posts
  savePost(userId: string, postId: string): Observable<any> {
    return this.http.post(this.apiUrl, { userId, postId }, { responseType: 'text' });
  }

  unsavePost(userId: string, postId: string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${userId}/${postId}`);
  }

  getSavedPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`);
  }

  isSavedPost(userId: string, postId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/is-saved/${userId}/${postId}`);
  }
}
