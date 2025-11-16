export class PostComment {
  public id?: string;
  public postId!: string;
  public userId!: string;
  public content!: string;
  public userName?: string;
  public createdAt?: Date;

  constructor(init?: Partial<PostComment>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
