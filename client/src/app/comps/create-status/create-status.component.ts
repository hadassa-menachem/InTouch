import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { User } from '../../classes/User';

@Component({
  selector: 'app-create-status',
  templateUrl: './create-status.component.html',
  styleUrls: ['./create-status.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule]
})
export class CreateStatusComponent implements OnInit {
  createStatusForm: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  textSize = 24;
  user: User = new User();

  // משתנים לשמירת מיקום הגרירה
  dragPosition = { x: 50, y: 50 };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public userSer: UserService
  ) {
    this.createStatusForm = this.fb.group({
      content: [''],
      mediaType: ['image', Validators.required],
      imageSource: ['upload', Validators.required],
      imageUrl: [''],
      textColor: ['#ffffff'],
      backgroundColor: ['#0f1b4c'],
      customText: ['']
    });
  }

ngOnInit(): void {
  this.user = this.userSer.getCurrentUser()!;
}

onMediaTypeChange() {
  this.clearPreviewAndFile();
}

onImageSourceChange() {
  const source = this.createStatusForm.get('imageSource')?.value;
  if (source === 'upload') {
    this.createStatusForm.get('imageUrl')?.setValue('');
    this.clearPreviewAndFile();
  } else if (source === 'url') {
      const url = this.createStatusForm.get('imageUrl')?.value;
      this.imagePreviewUrl = url || null;
      this.selectedFile = null;
  }
}

clearPreviewAndFile() {
  this.imagePreviewUrl = null;
  this.selectedFile = null;
}

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const mediaType = this.createStatusForm.get('mediaType')?.value;

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

  // מעדכן מיקום הגרירה
onDragEnded(event: any) {
  this.dragPosition = {
    x: event.source.getFreeDragPosition().x,
    y: event.source.getFreeDragPosition().y
};
}

/** פונקציה שמכניסה את הטקסט על גבי התמונה לפני שליחה לשרת */
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

  // מציירים את התמונה
  ctx.drawImage(img, 0, 0);
  // מוסיפים טקסט לפי המיקום הנגרר
  ctx.font = `${textSize}px Arial`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  ctx.fillText(text, posX, posY);

  // הופכים לקובץ חדש
  const blob: Blob = await new Promise(resolve =>
  canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.9)
  );
  return new File([blob], 'status.jpg', { type: 'image/jpeg' });
}

async onSubmit() {
  if (this.createStatusForm.invalid) return;
    const formValues = this.createStatusForm.value;
    const formData = new FormData();
    formData.append('userId', this.user.userId!);
    formData.append('textColor', formValues.textColor);
    formData.append('textSize', this.textSize.toString());
    formData.append('backgroundColor', formValues.backgroundColor);
    formData.append('mediaType', formValues.mediaType);
    let fileToSend: File | null = null;

  if (formValues.mediaType === 'image') {
    if (this.imagePreviewUrl) {
      fileToSend = await this.composeImageWithText(
      this.imagePreviewUrl,
      formValues.customText || '',
      formValues.textColor,
      this.textSize,
      this.dragPosition.x,
      this.dragPosition.y
      );
    }
    } else if (this.selectedFile) {
      fileToSend = this.selectedFile; // וידאו לא עובר "אפייה" עם טקסט
    }

    if (fileToSend) {
      formData.append('file', fileToSend, fileToSend.name);
    } else if (formValues.imageSource === 'url' && formValues.imageUrl) {
      formData.append('imageUrl', formValues.imageUrl);
    }

    this.userSer.addStatus(formData).subscribe({
      next: (createdStatus: any) => {
        this.router.navigate(['/status', createdStatus.id]);
      },
      error: err => {
        console.error('שגיאה בהעלאה:', err);
        alert('שגיאה בהעלאת הסטטוס');
      }
    });
  }
}
