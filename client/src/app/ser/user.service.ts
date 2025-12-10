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
  private userApi = 'https://localhost:7058/api/User';
  private postApi = 'https://localhost:7058/api/Post';
  private likeApi = 'https://localhost:7058/api/Like';
  private commentApi = 'https://localhost:7058/api/Comment';
  private followApi = 'https://localhost:7058/api/Follow';
  private messageApi = 'https://localhost:7058/api/Message';
  private storyApi = 'https://localhost:7058/api/Story';
  private savedApi = 'https://localhost:7058/api/SavedPost';
  
  constructor(private http: HttpClient) {
    const userFromStorage = localStorage.getItem('currentUser');
    if (userFromStorage) {
      this.currentUser = JSON.parse(userFromStorage);
    }
  }

  ngOnInit(): void {}

  // User management
  GetUserById(codeUser: string): Observable<User> {
    return this.http.get<User>(`${this.userApi}/${codeUser}`);
  }

  AddUser(user: any): Observable<User> {
    this.currentUser = user;
    return this.http.post<User>(`${this.userApi}`, user);
  }

  setCurrentUser(user: User) {
    this.currentUser = new User(user);
    console.log(this.currentUser);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateUser(id: string, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.userApi}${id}`, formData);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  GetAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApi}`);
  }

  getMediaFilesCount(user: User): number {
    return user!.mediaFiles!.length;
  }

  // Posts
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.postApi}`);
  }

  addPost(formData: FormData) {
    return this.http.post<void>(`${this.postApi}`, formData);
  }

  getPostsByUserId(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.postApi}/user/${userId}`);
  }

  getPostByPostId(postId: string): Observable<Post> {
    return this.http.get<Post>(`${this.postApi}/${postId}`);
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.postApi}/${id}`);
  }

  // Likes
  addLike(postId: string, userId: string): Observable<void> {
    const body = { postId, userId };
    return this.http.post<void>(`${this.likeApi}`, body);
  }

  deleteLike(postId: string, userId: string): Observable<void> {
    const params = new HttpParams()
      .set('postId', postId)
      .set('userId', userId);
    console.log('DELETE params:', params.toString());
    return this.http.delete<void>(`${this.likeApi}`, { params });
  }

  getLikesByPostId(postId: string): Observable<Like[]> {
    return this.http.get<Like[]>(`${this.likeApi}/post/${postId}`);
  }

  // Comments
  addComment(comment: PostComment): Observable<any> {
    return this.http.post<any>(`${this.commentApi}`, comment);
  }

  getCommentsByPostId(postId: string): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`${this.commentApi}/post/${postId}`);
  }

  // Follow management
  followUser(follow: Follow) {
    return this.http.post(`${this.followApi}`, follow);
  }

  unfollowUser(followerId: string, followeeId: string) {
    return this.http.delete(`${this.followApi}/by-users?followerId=${followerId}&followeeId=${followeeId}`);
  }

  isFollowing(followerId: string, followeeId: string) {
    return this.http.get<boolean>(`${this.followApi}/is-following?followerId=${followerId}&followeeId=${followeeId}`);
  }

  getFollowers(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.followApi}/followers/${userId}`);
  }

  getFollowings(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.followApi}/followees/${userId}`);
  }

  // Messaging
  getChats(userId: string) {
    return this.http.get<any[]>(`${this.messageApi}/user/${userId}`);
  }

  getConversation(user1Id: string, user2Id: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.messageApi}/between/${user1Id}/${user2Id}`);
  }

  getAllMessagesForUser(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.messageApi}/user/${userId}`);
  }

  sendMessage(message: Message): Observable<void> {
    return this.http.post<void>(`${this.messageApi}`, message);
  }

  sendMessageWithFile(formData: FormData): Observable<void> {
    return this.http.post<void>(`${this.messageApi}/send-with-file`, formData);
  }

  markMessagesAsRead(message: Message): Observable<any> {
    return this.http.post(`${this.messageApi}/mark-as-read`, message);
  }

  markMessagesAsDelivered(senderId: string, receiverId: string): Observable<any> {
    return this.http.post(`${this.messageApi}/mark-as-delivered`, { senderId, receiverId });
  }

  markAllMessagesAsDelivered(receiverId: string): Observable<any> {
    return this.http.post(`${this.messageApi}/mark-all-delivered`, { receiverId });
  }

  // Stories
  addStory(formData: FormData): Observable<any> {
  return this.http.post(`${this.storyApi}`, formData, {
    responseType: 'text'
  });
}

  getStoryByUserId(userId: string): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.storyApi}/user/${userId}`);
  }

  getStoryById(storyId: string): Observable<Story> {
    return this.http.get<Story>(`${this.storyApi}/${storyId}`);
  }

  getAllStories(): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.storyApi}`);
  }

  markStoryAsViewed(storyId: string, userId: string): Observable<any> {
    const body = { StoryId: storyId, ViewerId: userId };
    return this.http.post(`${this.storyApi}/mark-viewed`, body, { responseType: 'text' });
  }

  // Saved posts
  savePost(userId: string, postId: string): Observable<any> {
    return this.http.post(`${this.savedApi}`, { userId, postId }, { responseType: 'text' });
  }

  unsavePost(userId: string, postId: string) {
    return this.http.delete<{ message: string }>(`${this.savedApi}/${userId}/${postId}`);
  }

  getSavedPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.savedApi}/user/${userId}`);
  }

  isSavedPost(userId: string, postId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.savedApi}/is-saved/${userId}/${postId}`);
  }
}