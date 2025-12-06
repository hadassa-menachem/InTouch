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

  showMessage = false;
  messageText = '';
  isSuccess = true;

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
            this.showFloatingMessage('Error marking messages as delivered', false);
          },
        });

        this.router.navigate(['/home']);
      },
      error: () => {
        this.showFloatingMessage('User code does not exist', false);
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
