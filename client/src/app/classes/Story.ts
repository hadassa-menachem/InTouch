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
  likes?: string[];
  comments?: {
    userName: string;
    content: string;
  }[];
  createdAt!: Date;
  category!: string;
  viewedByUserIds?: string[];
  viewedByCurrentUser: boolean = false;
  isTemporary?: boolean;

  constructor(init?: Partial<Story>) {
    Object.assign(this, init);
    this.viewedByUserIds = this.viewedByUserIds || [];
    this.viewedByCurrentUser = false;
  }
}
