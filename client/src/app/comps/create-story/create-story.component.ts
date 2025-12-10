import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { User } from '../../classes/User';
import { LucideIconsModule } from '../../lucide.module';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.css'],
  standalone: true,
  imports: [CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    LucideIconsModule,
    PickerModule,
    EmojiModule
  ],})
export class CreateStoryComponent implements OnInit {
  createStoryForm: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  textSize = 24;
  user: User = new User();
  errImage:boolean=false;
  errVideo:boolean=false;
  showMessage = false;
  messageText = '';
  isSuccess = true;
  showEmojiPicker = false;
  dragPosition = { x: 50, y: 50 };

  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public userSer: UserService
  ) {
    this.createStoryForm = this.fb.group({
      content: [''],
      mediaType: ['image', Validators.required],
      imageSource: ['upload', Validators.required],
      imageUrl: [''],
      textColor: ['#ffffff'],
      backgroundColor: ['#0f1b4c'],
      customText: [''],
      durationHours: [24],
    });
  }

  ngOnInit(): void {
    this.user = this.userSer.getCurrentUser()!;

    this.createStoryForm.get('imageUrl')?.valueChanges.subscribe(url => {
      if (this.createStoryForm.get('imageSource')?.value === 'url') {
        this.imagePreviewUrl = url || null;
      }
    });
  }

  onImageSourceChange() {
    const source = this.createStoryForm.get('imageSource')?.value;
    if (source === 'upload') {
      this.createStoryForm.get('imageUrl')?.setValue('');
      this.clearPreviewAndFile();
    } else if (source === 'url') {
      const url = this.createStoryForm.get('imageUrl')?.value;
      this.imagePreviewUrl = url || null;
      this.selectedFile = null;
    }
  }

  onStoryTypeChange() {
    const storyType = this.createStoryForm.value.storyType;

    this.createStoryForm.patchValue({ durationHours: 24 });
  }

  onMediaTypeChange() {
    this.clearPreviewAndFile();
  }

  clearPreviewAndFile() {
    this.imagePreviewUrl = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const mediaType = this.createStoryForm.get('mediaType')?.value;

      if (mediaType === 'image' && !file.type.startsWith('image/')) {
        this.errImage = true;
        this.showFloatingMessage('Please select an image file only', false);
        return;
      }
      if (mediaType === 'video' && !file.type.startsWith('video/')) {
        this.errVideo = true;
        this.showFloatingMessage('Please select an video file only', false);
        return;
      }
      this.errImage = false;
      this.errVideo = false;
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onDragEnded(event: any) {
    const element = event.source.element.nativeElement;
    const parentRect = element.parentElement.getBoundingClientRect();
    const elemRect = element.getBoundingClientRect();

    this.dragPosition = {
      x: elemRect.left - parentRect.left,
      y: elemRect.top - parentRect.top
    };
  }
  
  private async composeImageWithText(
   baseImageSrc: string,
   text: string,
   textColor: string,
   textSize: number,
   posX: number,
   posY: number
   ): Promise<File> {

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = baseImageSrc;
  });


    const previewElement = document.querySelector('.story-preview') as HTMLElement;
    const previewWidth = previewElement.offsetWidth;
    const previewHeight = previewElement.offsetHeight;

  
    const scaleX = img.naturalWidth / previewWidth;
    const scaleY = img.naturalHeight / previewHeight;

    const realX = posX * scaleX;
    const realY = posY * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(img, 0, 0);

    ctx.font = `${textSize * scaleX}px Calibri`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'top';

    ctx.fillText(text, realX, realY);

    const blob: Blob = await new Promise(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.9)
  );

    return new File([blob], 'story.jpg', { type: 'image/jpeg' });
  }

  async onSubmit() {
    if (this.createStoryForm.invalid) return;

    const formValues = this.createStoryForm.value;
    const formData = new FormData();

    formData.append('UserId', this.user.userId!);

    let duration = formValues.durationHours || 24;
    if (duration > 24) duration = 24;
    formData.append('DurationInHours', duration.toString());

    if (formValues.customText) {
      formData.append('Content', formValues.customText);
    }

    let fileToSend: File | null = null;

    if (formValues.mediaType === 'image' && this.selectedFile) {

    const baseImageSrc = URL.createObjectURL(this.selectedFile);

    fileToSend = await this.composeImageWithText(
      baseImageSrc,
      formValues.customText || '',
      formValues.textColor,
      this.textSize,
      this.dragPosition.x,
      this.dragPosition.y
    );

    URL.revokeObjectURL(baseImageSrc);

    } else if (formValues.mediaType === 'video' && this.selectedFile) {
      fileToSend = this.selectedFile;
    }

    if (fileToSend) {
      formData.append('file', fileToSend, fileToSend.name);
    } else if (formValues.imageSource === 'url' && formValues.imageUrl) {
      formData.append('ImageUrl', formValues.imageUrl);
    }

    formData.forEach((value, key) => {
    });

    this.userSer.addStory(formData).subscribe({
      next: (res) => {
        this.showFloatingMessage('The story was successfully published!', true);
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
      },
      error: (err) => {
        this.showFloatingMessage('Error uploading story', false);
      }
    });
    console.log("fileToSend:", fileToSend);
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
      const current = this.createStoryForm.get('customText')?.value || '';
      this.createStoryForm.get('customText')?.setValue(current + emoji);
      setTimeout(() => this.messageInputRef?.nativeElement?.focus(), 0);
    }
  }
}