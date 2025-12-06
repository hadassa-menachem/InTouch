import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from '../../classes/User';
import { UserService } from '../../ser/user.service';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconsModule } from '../../lucide.module';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, LucideIconsModule, PickerModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  @ViewChild('bioTextarea') bioTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('bioEmojiPickerRef') bioEmojiPickerRef!: ElementRef;

  registerForm: FormGroup;
  submitted = false;
  user: User = new User();
  selectedFile: File | null = null;
  showBioEmojiPicker: boolean = false;

  showMessage = false;
  messageText = '';
  isSuccess = true;

  constructor(
    private fb: FormBuilder,
    private usersService: UserService,
    private http: HttpClient,
    public router: Router
  ) {
    this.registerForm = this.fb.group({
      userId: ['', Validators.required],
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
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.bioEmojiPickerRef?.nativeElement?.contains(event.target);
    const clickedButton = (event.target as HTMLElement)?.closest('.emoji-button-wrapper');
    if (!clickedInside && !clickedButton) {
      this.showBioEmojiPicker = false;
    }
  }

  toggleBioEmojiPicker(): void {
    this.showBioEmojiPicker = !this.showBioEmojiPicker;
  }

  addBioEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native;
    if (emoji) {
      const currentBio = this.registerForm.get('bio')?.value || '';
      this.registerForm.patchValue({
        bio: currentBio + emoji
      });
      setTimeout(() => this.bioTextarea?.nativeElement?.focus(), 0);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.user = this.registerForm.value;
    const formData = new FormData();

    for (const key in this.user) {
      if (this.user[key as keyof User]) {
        formData.append(key, this.user[key as keyof User]!.toString());
      }
    }

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    } else {
      const defaultFile = new File([], 'assets/images/default-profile.jpg', { type: 'image/jpg' });
      formData.append('profileImage', defaultFile);
    }

    formData.append('createdAt', new Date().toISOString());
    const dob = new Date(this.user.dateOfBirth!);
    formData.set('dateOfBirth', dob.toISOString());

    this.http.post('https://localhost:7058/api/user', formData).subscribe({
      next: () => {
        this.usersService.currentUser = this.user;
        this.showFloatingMessage('Registration successful!', true);
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: err => {
        console.error('Registration error:', err);
        this.showFloatingMessage('Registration failed', false);
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
}