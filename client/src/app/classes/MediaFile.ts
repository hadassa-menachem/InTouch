export class MediaFile {
  constructor(
    public id?: string,
    public url: string = '',
    public mediaType: string = '',
    public uploadedAt: Date = new Date(),
    public userId?: string
  ) {}
}