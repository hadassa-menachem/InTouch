import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../ser/user.service';
import { User } from '../../classes/User';
import { LucideIconsModule } from '../../lucide.module';

@Component({
  selector: 'app-createpost',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule, LucideIconsModule],
  templateUrl: './createpost.component.html',
  styleUrls: ['./createpost.component.css']
})
export class CreatePostComponent implements OnInit {
  createPostForm: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  textSize = 24;
  user: User = new User();

  showMessage = false;
  messageText = '';
  isSuccess = true;

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
      textColor: ['#ffffff'],
      backgroundColor: ['#0f1b4c'],
      customText: ['']
    });
  }

  ngOnInit(): void {
    this.user = this.userSer.getCurrentUser()!;
    console.log(this.user);
  }

  onMediaTypeChange() {
    this.clearPreviewAndFile();
  }

  onImageSourceChange() {
    const source = this.createPostForm.get('imageSource')?.value;
    if (source === 'upload') {
      this.createPostForm.get('imageUrl')?.setValue('');
      this.clearPreviewAndFile();
    } else if (source === 'url') {
      const url = this.createPostForm.get('imageUrl')?.value;
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
      const mediaType = this.createPostForm.get('mediaType')?.value;

      if (mediaType === 'image' && !file.type.startsWith('image/')) {
        this.showFloatingMessage('Please select an image file only', false);
        return;
      }
      if (mediaType === 'video' && !file.type.startsWith('video/')) {
        this.showFloatingMessage('Please select a video file only', false);
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

  onSubmit() {
    if (this.createPostForm.invalid) {
      return;
    }

    const formValues = this.createPostForm.value;
    const formData = new FormData();

    formData.append('content', formValues.customText || '');
    formData.append('userId', this.user.userId);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.userSer.addPost(formData).subscribe({
      next: (response) => {
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
}
