export class Story {
  id!: string;
  user!: {
    userId: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    profilePicUrl?: string;
  };
  content?: string;
  imageUrl?: string;
  likes: string[] = [];
  comments: { userName: string; content: string }[] = [];
  createdAt!: Date;
  viewedByUserIds: string[] = [];
  viewedByCurrentUser: boolean = false;
  durationInHours: number = 24; 
  
  constructor(init?: Partial<Story>) {
    Object.assign(this, init);
    this.likes = this.likes || [];
    this.comments = this.comments || [];
    this.viewedByUserIds = this.viewedByUserIds || [];
    this.durationInHours = init?.durationInHours ?? 24;
  }
}
