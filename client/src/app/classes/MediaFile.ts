export class MediaFile {
  constructor(
    public id?: string,
    public url: string = '',
    public mediaType: string = '',
    public userId?: string
  ) {}
}