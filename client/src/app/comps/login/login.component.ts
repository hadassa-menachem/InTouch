import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { UserService } from '../../ser/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIf
  ]
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  showMessage = false;
  messageText = '';
  isSuccess = true;

  constructor(
    private fb: FormBuilder,
    private userSer: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      codeUser: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const user = this.userSer.currentUser;
    if (user) {
      this.router.navigate(['/home']);
    }
  }

  get codeUser() {
    return this.loginForm.get('codeUser');
  }

  onSubmit() {
    const codeUserValue = this.codeUser?.value;

    this.userSer.GetUserById(codeUserValue).subscribe({
      next: (userFromServer) => {
        this.userSer.currentUser = userFromServer;
        localStorage.setItem(
          'currentUser',
          JSON.stringify(userFromServer)
        );

        this.userSer
          .startSignalRConnection(userFromServer.userId)
          .then(() => {

            this.userSer
              .markAllMessagesAsDelivered(userFromServer.userId)
              .subscribe({
                next: () => {
                  console.log('All messages marked as delivered');
                  this.showFloatingMessage('Login successful!', true);

                  setTimeout(() => {
                    this.router.navigate(['/home']);
                  }, 1000);
                },
                error: (err) => {
                  console.error(
                    'Error marking all messages as delivered:',
                    err
                  );
                  this.router.navigate(['/home']);
                }
              });

          })
          .catch(err => {
            console.error('SignalR connection failed:', err);
            this.router.navigate(['/home']);
          });
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.showFloatingMessage('User code does not exist', false);
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  showFloatingMessage(
    text: string,
    success: boolean = true
  ) {
    this.messageText = text;
    this.isSuccess = success;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }
}