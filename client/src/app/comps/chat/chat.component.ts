import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
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
export class ChatComponent implements OnInit, OnDestroy {

  newMessage: string = '';
  messages: Message[] = [];
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  showEmojiPicker: boolean = false;
  currentUserId: string = '';
  targetUserId: string = '';
  targetUser: any = null;
  shouldAutoScroll: boolean = true;
  selectedFileType: 'image' | 'pdf' | null = null;
  private signalRReady: boolean = false;

  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public userSer: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.userSer.currentUser?.userId!;

    if (!this.currentUserId) {
      console.error('No current user!');
      this.router.navigate(['/login']);
      return;
    }

    this.userSer.startSignalRConnection(this.currentUserId).then(() => {
      this.signalRReady = true;
      this.setupSignalRListeners();
    }).catch(err => {
      console.error('SignalR failed:', err);
    });

    this.route.params.subscribe(params => {
      this.targetUserId = params['id'];

      this.loadTargetUser();
      this.loadMessages();
      this.markAsDelivered();
    });
  }

  ngOnDestroy(): void {
    console.log('Chat component destroyed');
  }

  private setupSignalRListeners(): void {

    this.userSer.onReceiveMessage((message: Message) => {
      console.log('[ReceiveMessage]', {
        id: message.id,
        from: message.senderId,
        to: message.receiverId,
        content: message.content?.substring(0, 20)
      });

      const isRelevant = 
        (message.senderId === this.targetUserId && message.receiverId === this.currentUserId) ||
        (message.senderId === this.currentUserId && message.receiverId === this.targetUserId);

      if (!isRelevant) {
        console.log('Message not relevant to this chat');
        return;
      }

      const existingIndex = this.messages.findIndex(m => m.id === message.id);
      
      if (existingIndex !== -1) {
        this.messages[existingIndex] = {
          ...this.messages[existingIndex],
          ...message,
          imageUrl: this.fixImageUrl(message.imageUrl),
          sent: message.senderId === this.currentUserId,
          fileType: this.getFileType(message.imageUrl)
        };
      } else {
        this.messages.push({
          ...message,
          imageUrl: this.fixImageUrl(message.imageUrl),
          sent: message.senderId === this.currentUserId,
          fileType: this.getFileType(message.imageUrl)
        });
      }

      this.scrollToBottom();

      if (message.receiverId === this.currentUserId && !message.isRead) {
        setTimeout(() => this.markMessageAsRead(message), 500);
      }
    });

    this.userSer.onMessageRead((data: any) => {
      
      const msg = this.messages.find(m => m.id === data.messageId);
      if (msg) {
        msg.isRead = true;
      } else {
        console.warn('Message not found for read status:', data.messageId);
      }
    });

    this.userSer.onMessagesDelivered((data: any) => {
      console.log('[MessagesDelivered]', data);
      
      if (data.receiverId === this.targetUserId && data.senderId === this.currentUserId) {
        let updatedCount = 0;
        this.messages.forEach(m => {
          if (m.senderId === this.currentUserId && 
              m.receiverId === this.targetUserId && 
              !m.isDelivered) {
            m.isDelivered = true;
            updatedCount++;
          }
        });
        console.log(`Updated ${updatedCount} messages as delivered`);
      }
    });

    this.userSer.onAllMessagesDelivered((data: any) => {
      
      let updatedCount = 0;
      this.messages.forEach(m => {
        if (m.receiverId === data.receiverId && !m.isDelivered) {
          m.isDelivered = true;
          updatedCount++;
        }
      });
      console.log(`Updated ${updatedCount} messages as delivered (all)`);
    });
  }

  private fixImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return 'https://localhost:7058' + url;
  }

  private getFileType(url: string | undefined): 'image' | 'pdf' | undefined {
    if (!url) return undefined;
    return url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
  }

  private markMessageAsRead(message: Message): void {
    this.userSer.markMessagesAsRead(message).subscribe({
      next: () => {
        const msg = this.messages.find(m => m.id === message.id);
        if (msg) msg.isRead = true;
      },
      error: (err) => console.error('Error marking as read:', err)
    });
  }

  private markAsDelivered(): void {

  console.log(`Marking messages from ${this.targetUserId} to ${this.currentUserId} as delivered`);
  
  this.userSer.markMessagesAsDelivered(this.targetUserId, this.currentUserId).subscribe({
    next: () => console.log('Messages from this user marked as delivered'),
    error: (err) => console.error('Error marking messages as delivered:', err)
  });
}

  loadTargetUser(): void {
    this.userSer.GetUserById(this.targetUserId).subscribe({
      next: user => {
        this.targetUser = user;
      },
      error: err => console.error('Error loading user:', err)
    });
  }

  loadMessages(): void {    
    this.userSer.getConversation(this.currentUserId, this.targetUserId).subscribe({
      next: msgs => {
        console.log(`✅ Loaded ${msgs.length} messages`);
        
        this.messages = msgs.map(m => ({
          ...m,
          imageUrl: this.fixImageUrl(m.imageUrl),
          sent: m.senderId === this.currentUserId,
          fileType: this.getFileType(m.imageUrl)
        }));

        this.scrollToBottom();

        this.messages.forEach(msg => {
          if (msg.receiverId === this.currentUserId && !msg.isRead) {
            this.markMessageAsRead(msg);
          }
        });
      },
      error: err => console.error('Error loading messages:', err)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedFile) {
      return;
    }

    if (!this.signalRReady) {
      setTimeout(() => this.sendMessage(), 500);
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('SenderId', this.currentUserId);
      formData.append('ReceiverId', this.targetUserId);
      formData.append('Content', this.newMessage.trim());
      formData.append('image', this.selectedFile);

      this.userSer.sendMessageWithFile(formData).subscribe({
        next: (msg) => console.log('File message sent:', msg.id),
        error: (err) => console.error('Error sending file:', err)
      });
    } else {
      const messageData = {
        senderId: this.currentUserId,
        receiverId: this.targetUserId,
        content: this.newMessage.trim()
      };

      this.userSer.sendMessage(messageData).subscribe({
        next: (msg) => console.log('Text message sent:', msg.id),
        error: (err) => console.error('Error sending message:', err)
      });
    }

    this.newMessage = '';
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.selectedFileType = null;
  }

  scrollToBottom(): void {
    if (!this.shouldAutoScroll) return;
    setTimeout(() => {
      const element = document.querySelector('.chat-messages');
      if (element) element.scrollTop = element.scrollHeight;
    }, 100);
  }

  onUserScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    this.shouldAutoScroll = distanceFromBottom < 100;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.emojiPickerRef?.nativeElement?.contains(event.target);
    const clickedButton = (event.target as HTMLElement)?.closest('.emoji-button-wrapper');
    if (!clickedInside && !clickedButton) this.showEmojiPicker = false;
  }

  toggleEmojiPicker(): void { 
    this.showEmojiPicker = !this.showEmojiPicker; 
  }

  addEmoji(event: any): void { 
    this.newMessage = (this.newMessage || '') + event.emoji.native; 
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
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      if (file.type.startsWith('image/')) {
        this.selectedFileType = 'image';
        const reader = new FileReader();
        reader.onload = () => this.selectedFilePreview = reader.result as string;
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        this.selectedFileType = 'pdf';
      }
    }
  }

  removeSelectedFile(): void { 
    this.selectedFile = null; 
    this.selectedFilePreview = null; 
    this.selectedFileType = null; 
  }

  isNewDay(index: number): boolean {
    if (!this.messages || !this.messages[index]) return false;
    const currentDate = new Date(this.messages[index].sentAt);
    if (index === 0) return true;
    const prevDate = new Date(this.messages[index - 1].sentAt);
    return currentDate.toDateString() !== prevDate.toDateString();
  }

  formatDay(dateStr: string | Date): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(); 
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  navigate(route: string): void { 
    this.router.navigate([route]);
  }
  
  GoToUser(): void { 
    this.router.navigate(['/user-profile', this.targetUserId]); 
  }
}