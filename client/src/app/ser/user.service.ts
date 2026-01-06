import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { User } from '../classes/User';
import { Post } from '../classes/Post';
import { Message } from '../classes/Message';
import { PostComment } from '../classes/PostComment';
import { Follow } from '../classes/Follow';
import { Like } from '../classes/Like';
import { Story } from '../classes/Story';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: User | null = null;

  private userApi = 'https://localhost:7058/api/User';
  private postApi = 'https://localhost:7058/api/Post';
  private likeApi = 'https://localhost:7058/api/Like';
  private commentApi = 'https://localhost:7058/api/Comment';
  private followApi = 'https://localhost:7058/api/Follow';
  private messageApi = 'https://localhost:7058/api/Message';
  private storyApi = 'https://localhost:7058/api/Story';
  private savedApi = 'https://localhost:7058/api/SavedPost';
  private aiApi = 'https://localhost:7058/AiService';

  constructor(private http: HttpClient) {
    const userFromStorage = localStorage.getItem('currentUser');
    if (userFromStorage) {
      this.currentUser = JSON.parse(userFromStorage);
    }
  }

// SignalR Section

private hubConnection?: signalR.HubConnection;
private isConnected = false;
private connectionPromise?: Promise<void>;

startSignalRConnection(userId: string): Promise<void> {

  if (this.isConnected && this.hubConnection) {
    console.log('SignalR already connected');
    return Promise.resolve();
  }

  if (this.connectionPromise) {
    return this.connectionPromise;
  }


  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:7058/messageHub?userId=${userId}`)
    .withAutomaticReconnect([0, 2000, 5000, 10000]) // ניסיונות חיבור מחדש
    .configureLogging(signalR.LogLevel.Information)
    .build();

  this.hubConnection.onclose((error) => {
    this.isConnected = false;
    this.connectionPromise = undefined;
  });

  this.hubConnection.onreconnecting((error) => {
    this.isConnected = false;
  });

  this.hubConnection.onreconnected((connectionId) => {
    this.isConnected = true;
  });

  this.connectionPromise = this.hubConnection.start()
    .then(() => {
      this.isConnected = true;
    })
    .catch((err) => {
      console.error('SignalR connection failed:', err);
      this.isConnected = false;
      this.connectionPromise = undefined;
      throw err;
    });

  return this.connectionPromise;
}

onReceiveMessage(callback: (msg: any) => void) {
  if (!this.hubConnection) {
    console.warn('Hub connection not initialized');
    return;
  }
  
  this.hubConnection.off('ReceiveMessage');
  this.hubConnection.on('ReceiveMessage', (msg) => {
    callback(msg);
  });
}

onMessageRead(callback: (data: any) => void) {
  if (!this.hubConnection) {
    console.warn('Hub connection not initialized');
    return;
  }
  
  this.hubConnection.off('MessageRead');
  this.hubConnection.on('MessageRead', (data) => {
    callback(data);
  });
}

onMessagesDelivered(callback: (data: any) => void) {
  if (!this.hubConnection) {
    console.warn('Hub connection not initialized');
    return;
  }
  
  this.hubConnection.off('MessagesDelivered');
  this.hubConnection.on('MessagesDelivered', (data) => {
    callback(data);
  });
}

onAllMessagesDelivered(callback: (data: any) => void) {
  if (!this.hubConnection) {
    console.warn('Hub connection not initialized');
    return;
  }
  
  this.hubConnection.off('AllMessagesDelivered');
  this.hubConnection.on('AllMessagesDelivered', (data) => {
    callback(data);
  });
}


  public sendMessage(message: { senderId: string, receiverId: string, content: string }): Observable<Message> {
    return this.http.post<Message>(`${this.messageApi}`, message);
  }

  public sendMessageWithFile(formData: FormData): Observable<Message> {
    return this.http.post<Message>(`${this.messageApi}/send-with-file`, formData);
  }

  // User
  GetUserById(codeUser: string): Observable<User> {
    return this.http.get<User>(`${this.userApi}/${codeUser}`);
  }

  AddUser(user: User): Observable<User> {
    this.currentUser = user;
    return this.http.post<User>(`${this.userApi}`, user);
  }

  setCurrentUser(user: User): void {
    this.currentUser = new User(user);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateUser(id: string, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.userApi}/${id}`, formData);
  }

  logout(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  GetAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApi}`);
  }

  getMediaFilesCount(user: User): number {
    return user.mediaFiles?.length || 0;
  }

  // Posts
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.postApi}`);
  }

  addPost(formData: FormData): Observable<void> {
    return this.http.post<void>(`${this.postApi}`, formData);
  }

  getPostsByUserId(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.postApi}/user/${userId}`);
  }

  getPostByPostId(postId: string): Observable<Post> {
    return this.http.get<Post>(`${this.postApi}/${postId}`);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.postApi}/${id}`);
  }

  summarize(text: string): Observable<string> {
    return this.http.post(this.aiApi, { text }, { responseType: 'text' });
  }

  // Likes
  addLike(postId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.likeApi}`, { postId, userId });
  }

  deleteLike(postId: string, userId: string): Observable<void> {
    const params = new HttpParams().set('postId', postId).set('userId', userId);
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

  // Follow
  followUser(follow: Follow): Observable<any> {
    return this.http.post(`${this.followApi}`, follow);
  }

  unfollowUser(followerId: string, followeeId: string): Observable<any> {
    return this.http.delete(`${this.followApi}/by-users`, {
      params: new HttpParams()
        .set('followerId', followerId)
        .set('followeeId', followeeId)
    });
  }

  isFollowing(followerId: string, followeeId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.followApi}/is-following`, {
      params: new HttpParams()
        .set('followerId', followerId)
        .set('followeeId', followeeId)
    });
  }

  getFollowers(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.followApi}/followers/${userId}`);
  }

  getFollowings(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.followApi}/followees/${userId}`);
  }

  // Messaging 
  getConversation(user1Id: string, user2Id: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.messageApi}/between/${user1Id}/${user2Id}`);
  }

  getAllMessagesForUser(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.messageApi}/user/${userId}`);
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
    return this.http.post(`${this.storyApi}`, formData, { responseType: 'text' });
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
    return this.http.post(`${this.storyApi}/mark-viewed`, { StoryId: storyId, ViewerId: userId }, { responseType: 'text' });
  }

  // Saved Posts
  savePost(userId: string, postId: string): Observable<any> {
    return this.http.post(`${this.savedApi}`, { userId, postId }, { responseType: 'text' });
  }

  unsavePost(userId: string, postId: string): Observable<any> {
    return this.http.delete(`${this.savedApi}/${userId}/${postId}`);
  }

  getSavedPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.savedApi}/user/${userId}`);
  }

  isSavedPost(userId: string, postId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.savedApi}/is-saved/${userId}/${postId}`);
  }
}