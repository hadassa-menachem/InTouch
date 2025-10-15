import { MediaFile } from "./MediaFile";

export class User {
  userId!: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: string;
  phone?: string;
  email?: string;
  password?: string;
  bio?: string;
  createdAt?: Date;
  mediaFiles?: MediaFile[] = [];
  followersList?: User[] = [];
  followingsList?: User[] = [];
  profilePicUrl?: string; 

constructor(init?: Partial<User>) {
  Object.assign(this, init);
}
}
