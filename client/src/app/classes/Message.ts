export class Message {
  senderId!: string;
  receiverId!: string;
  content!: string;
  sentAt!: Date;
  imageUrl?: string;
  sent?: boolean;
  isRead?: boolean = false;
  isDelivered?: boolean = false;
  id?: string
}
