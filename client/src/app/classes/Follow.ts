export class Follow {
  public followeeId!: string;
  public followerId!: string;
  public followedAt?: Date;

  constructor(init?: Partial<Follow>) {
    Object.assign(this, init);
  }
}