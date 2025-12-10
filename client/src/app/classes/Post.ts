import { MediaFile } from "./MediaFile";
import { Like } from "./Like";
import { User } from "./User"; 
import { PostComment } from "./PostComment";

export class Post {
  constructor(
    public id?: string,
    public content: string = '',
    public mediaFiles: MediaFile[] = [],
    public likes: Like[] = [],
    public comments: PostComment[] = [],
    public user?: User
  ) {}
}