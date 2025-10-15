import { MediaFile } from "./MediaFile";
import { Like } from "./Like";
import { User } from "./User"; 
import { PostComment } from "./PostComment";

export class Post {
  constructor(
    public id?: string,
    public userId?: string,
    public content: string = '',
    public mediaFiles: MediaFile[] = [],
    public createdAt: Date = new Date(),
    public likeCount: number = 0,
    public commentCount: number = 0,
    public userName: string = '',
    public likes: Like[] = [],
    public user?: User,
    public comments: PostComment[]=[]) {
  }
}
