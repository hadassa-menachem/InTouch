import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { User } from '../../classes/User';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule]
})
export class CreateStoryComponent implements OnInit {
  createStoryForm: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  textSize = 24;
  user: User = new User();

  showMessage = false;
  messageText = '';
  isSuccess = true;

  dragPosition = { x: 50, y: 50 };

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
        alert('נא לבחור קובץ תמונה בלבד');
        return;
      }
      if (mediaType === 'video' && !file.type.startsWith('video/')) {
        alert('נא לבחור קובץ וידאו בלבד');
        return;
      }

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

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(img, 0, 0);
    ctx.font = `${textSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'top';
    ctx.fillText(text, posX, posY);

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

    if (formValues.content) {
      formData.append('Content', formValues.content);
    }
    if (formValues.customText) {
      formData.append('Content', formValues.customText);
    }

    let fileToSend: File | null = null;

    if (formValues.mediaType === 'image' && this.imagePreviewUrl) {
      fileToSend = await this.composeImageWithText(
        this.imagePreviewUrl,
        formValues.customText || '',
        formValues.textColor,
        this.textSize,
        this.dragPosition.x,
        this.dragPosition.y
      );
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
  }

  showFloatingMessage(text: string, success: boolean = true) {
    this.messageText = text;
    this.isSuccess = success;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }
}
