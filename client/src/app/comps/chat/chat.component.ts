import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideIconsModule } from '../../lucide.module';
import { Message } from '../../classes/Message';
import { UserService } from '../../ser/user.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, FormsModule, PickerModule, LucideIconsModule],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatComponent implements OnInit {
  newMessage: string = '';
  messages: Message[] = [];
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  showEmojiPicker: boolean = false;

  currentUserId: string = '';
  targetUserId: string = '';
  targetUser: any = null;

  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public userSer: UserService
  ) {}

ngOnInit(): void {
  this.currentUserId = this.userSer.currentUser?.userId!;
  
  this.route.params.subscribe(params => {
    this.targetUserId = params['id'];

    this.loadTargetUser();
    this.loadMessages();

    setInterval(() => {
  this.get(); 
}, 3000);
  })
  console.log(this.currentUserId+"   "+this.targetUserId)
}

loadTargetUser(): void {
  if (this.targetUserId) {
      this.userSer.GetUserById(this.targetUserId).subscribe({
      next: user => this.targetUser = user,
      error: err => console.error('שגיאה בטעינת פרטי משתמש', err)
    });
  }
}

loadMessages() {
  if (this.currentUserId && this.targetUserId) {
      this.userSer.getConversation(this.currentUserId, this.targetUserId).subscribe({
      next: msgs => {
      this.messages = msgs.map(m => {
      let imageUrl = m.imageUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = 'https://localhost:7058' + imageUrl;
      }
  return {
      ...m,
      imageUrl: imageUrl,
      sent: m.senderId === this.currentUserId,
      isRead: m.isRead 
      };
      });
      this.scrollToBottom();
      this.messages.forEach(msg => {
      if(msg.receiverId == this.currentUserId){
        this.userSer.markMessagesAsRead(msg).subscribe({
        next: () => {
        msg.isRead = true; 
        }
        });
        }
      });
    }
 });
 }
}

get(){
  if (this.currentUserId && this.targetUserId) {
    this.userSer.getConversation(this.currentUserId, this.targetUserId).subscribe({
      next: msgs => {
        this.messages = msgs.map(m => {
          let imageUrl = m.imageUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = 'https://localhost:7058' + imageUrl;
          }
          return {
            ...m,
            imageUrl: imageUrl,
            sent: m.senderId === this.currentUserId,
            isRead: m.isRead 
          };
        });

        this.scrollToBottom();
        this.messages.forEach(msg => {
        console.log("fdvdv"+msg.receiverId+this.currentUserId)
        });
      }
    });
  }
}
  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedFile) return;
    const formData = new FormData();
    formData.append('senderId', this.currentUserId);
    formData.append('receiverId', this.targetUserId);
    formData.append('content', this.newMessage.trim() || '');
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    this.userSer.sendMessageWithFile(formData).subscribe({
      next: (msgFromServer: any) => {
        let imageUrl = msgFromServer.imageUrl;
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = 'https://localhost:7058' + imageUrl;
        }
        const newMsg: Message = {
          senderId: msgFromServer.senderId,
          receiverId: msgFromServer.receiverId,
          content: msgFromServer.content,
          sentAt: new Date(msgFromServer.sentAt),
          //sent: true,
          imageUrl: imageUrl || null,
          isRead: false,
          isDelivered: false
        };
        this.messages.push(newMsg);
        this.newMessage = '';
        this.selectedFile = null;
        this.selectedFilePreview = null;
        this.scrollToBottom();
    },
    error: err => console.error('שגיאה בשליחת הודעה עם קובץ', err)
  });
}

scrollToBottom(): void {
  setTimeout(() => {
    const element = document.querySelector('.chat-messages');
    if (element) {
    element.scrollTop = element.scrollHeight;
    }
   }, 0);
}

onDocumentClick(event: MouseEvent): void {
  const clickedInside = this.emojiPickerRef?.nativeElement?.contains(event.target);
  const clickedButton = (event.target as HTMLElement)?.closest('.emoji-button-wrapper');
  if (!clickedInside && !clickedButton) {
    this.showEmojiPicker = false;
  }
}

toggleEmojiPicker(): void {
  this.showEmojiPicker = !this.showEmojiPicker;
}

addEmoji(event: any): void {
  const emoji = event?.emoji?.native || event?.native;
  if (emoji) {
    this.newMessage += emoji;
    setTimeout(() => this.messageInputRef?.nativeElement?.focus(), 0);
  }
}

handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    this.onEnterKey();
  }
}

onEnterKey(): void {
  if (this.newMessage.trim() || this.selectedFile) {
    this.sendMessage();
    this.showEmojiPicker = false;
  }
}

onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.selectedFilePreview = reader.result as string;
    reader.readAsDataURL(file);
  }
}

removeSelectedFile(): void {
  this.selectedFile = null;
  this.selectedFilePreview = null;
}

navigate(route: string): void {
  this.router.navigate([route]);
}

GoToUser(): void {
  this.router.navigate(['/user-profile']);
}
}
