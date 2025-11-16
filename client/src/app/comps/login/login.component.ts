import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersSer: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      codeUser: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const userFromStorage = localStorage.getItem('currentUser');
    if (userFromStorage) {
      const parsedUser = JSON.parse(userFromStorage);
      this.usersSer.currentUser = parsedUser;
      this.router.navigate(['/profile']);
    }
  }

  get codeUser() {
    return this.loginForm.get('codeUser');
  }

  onSubmit() {
    const codeUserValue = this.codeUser?.value;
    this.usersSer.GetUserById(codeUserValue).subscribe({
      next: (userFromServer) => {
        this.usersSer.currentUser = userFromServer;

        localStorage.setItem('currentUser', JSON.stringify(userFromServer));
        this.usersSer.markAllMessagesAsDelivered(userFromServer.userId).subscribe({
          next: () => {
            console.log('כל ההודעות סומנו כנמסרות');
          },
          error: err => console.error('שגיאה בסימון הודעות כנמסרות', err)
        });

        this.router.navigate(['/home']);
      },
      error: () => {
        alert('שגיאה: קוד משתמש לא קיים');
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
