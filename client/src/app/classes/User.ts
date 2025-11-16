import { MediaFile } from "./MediaFile";
import { Story } from "./Story";

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
  stories?: Story[] = [];

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }
}
