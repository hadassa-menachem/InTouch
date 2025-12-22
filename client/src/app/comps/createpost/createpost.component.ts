import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { UserService } from '../../ser/user.service';
import { User } from '../../classes/User';
import { LucideIconsModule } from '../../lucide.module';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-createpost',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    LucideIconsModule,
    PickerModule,
    EmojiModule
  ],
  templateUrl: './createpost.component.html',
  styleUrls: ['./createpost.component.css']
})
export class CreatePostComponent implements OnInit {
  createPostForm: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  user: User = new User();
  showEmojiPicker = false;
  errImage: boolean = false;
  errVideo: boolean = false;
  showMessage = false;
  messageText = '';
  isSuccess = true;

  showTextInput = false;

  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;
  @ViewChild('emojiButtonRef') emojiButtonRef!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public userSer: UserService
  ) {
    this.createPostForm = this.fb.group({
      content: [''],
      mediaType: ['image', Validators.required],
      imageSource: ['upload', Validators.required],
      imageUrl: [''],
      customText: ['']
    });
  }

  ngOnInit(): void {
    this.user = this.userSer.getCurrentUser()!;
  }

  toggleTextInput(): void {
    this.showTextInput = !this.showTextInput;
    this.showEmojiPicker = false;
  }

  clearPreviewAndFile() {
    this.imagePreviewUrl = null;
    this.selectedFile = null;
  }

  removeMedia() {
    this.clearPreviewAndFile();
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        this.showFloatingMessage('Please select an image or video file', false);
        return;
      }

      this.selectedFile = file;
      
      if (file.type.startsWith('image/')) {
        this.createPostForm.patchValue({ mediaType: 'image' });
      } else if (file.type.startsWith('video/')) {
        this.createPostForm.patchValue({ mediaType: 'video' });
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.createPostForm.invalid) return;

    const formValues = this.createPostForm.value;
    const formData = new FormData();

    formData.append('content', formValues.customText || '');
    formData.append('userId', this.user.userId);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.userSer.addPost(formData).subscribe({
      next: () => {
        this.showFloatingMessage('Post published successfully!', true);
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
      },
      error: () => {
        this.showFloatingMessage('Failed to publish the post', false);
      }
    });
  }

  showFloatingMessage(text: string, success: boolean = true) {
    this.messageText = text;
    this.isSuccess = success;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.emojiPickerRef?.nativeElement?.contains(event.target) ?? false;
    const clickedButton = this.emojiButtonRef?.nativeElement?.contains(event.target) ?? false;
    
    if (!clickedInside && !clickedButton) {
      this.showEmojiPicker = false;
    }
  }

  toggleEmojiPicker(event: Event): void {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native;
    if (emoji) {
      const current = this.createPostForm.get('customText')?.value || '';
      this.createPostForm.get('customText')?.setValue(current + emoji);
      setTimeout(() => this.messageInputRef?.nativeElement?.focus(), 0);
    }
  }
}