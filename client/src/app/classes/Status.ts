export class Status {
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
}
