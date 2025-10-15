export class PostComment {
  constructor(
    public postId?: string,
    public userId?: string,
    public content?: string,
    public userName?:string
  ) {}
}
