import { Component, OnInit } from '@angular/core';
import { User } from '../../classes/User';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../ser/user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-update-user',
  standalone: true,
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css',
  imports: [ReactiveFormsModule]
})
export class UpdateUserComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  user: User = new User();
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UserService,
    private http: HttpClient,
    public router: Router
  ) {
    this.registerForm = this.fb.group({
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
      this.registerForm.patchValue({
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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const updatedUser = { ...this.user, ...this.registerForm.value };
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
        alert('המשתמש עודכן בהצלחה');
        this.router.navigate(['/profile']);
      },
      error: err => {
        console.error('שגיאה בעדכון המשתמש:', err);
        alert('אירעה שגיאה בעדכון');
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
