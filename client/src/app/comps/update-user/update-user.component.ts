import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { User } from '../../classes/User';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../ser/user.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from '../../lucide.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-update-user',
  standalone: true,
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css',
  imports: [CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    LucideIconsModule,
    PickerModule,
    EmojiModule
  ],})
export class UpdateUserComponent implements OnInit {
  updateForm: FormGroup;
  submitted = false;
  user: User = new User();
  selectedFile: File | null = null;
  showMessage = false;
  messageText = '';
  isSuccess = true;
  showEmojiPicker = false;

  @ViewChild('emojiPickerRef') emojiPickerRef!: ElementRef;
  @ViewChild('messageInputRef') messageInputRef!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private usersService: UserService,
    private http: HttpClient,
    public router: Router
  ) {
    this.updateForm = this.fb.group({
      userName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      bio: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const currentUser = this.usersService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      this.updateForm.patchValue({
        userName: this.user.userName,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        dateOfBirth: this.user.dateOfBirth,
        gender: this.user.gender,
        phone: this.user.phone,
        email: this.user.email,
        bio: this.user.bio,
        password: this.user.password
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const updatedUser = { ...this.user, ...this.updateForm.value };
    const formData = new FormData();

    for (const key in updatedUser) {
      const value = updatedUser[key as keyof User];
      if (value && key !== 'profilePicUrl') {
        formData.append(key, value.toString());
      }
    }

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    const dob = new Date(updatedUser.dateOfBirth!);
    formData.set('dateOfBirth', dob.toISOString());

    this.usersService.updateUser(this.user.userId, formData).subscribe({
      next: () => {
        this.usersService.setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.showFloatingMessage('User updated successfully', true);
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000);
      },
      error: err => {
        this.showFloatingMessage('An error occurred while updating', false);
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
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
      const current = this.updateForm.get('bio')?.value || '';
      this.updateForm.get('bio')?.setValue(current + emoji);
      setTimeout(() => this.messageInputRef?.nativeElement?.focus(), 0);
    }
  }
}