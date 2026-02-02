import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class LoginComponent implements OnInit, OnDestroy {

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

  ngOnDestroy(): void {
  }

  get codeUser() {
    return this.loginForm.get('codeUser');
  }

  onSubmit() {
    const codeUserValue = this.codeUser?.value;

    this.userSer.GetUserById(codeUserValue).subscribe({
      next: (userFromServer) => {
        console.log('User logged in:', userFromServer.userId);
        
        this.userSer.currentUser = userFromServer;
        localStorage.setItem('currentUser', JSON.stringify(userFromServer));

        this.userSer.startSignalRConnection(userFromServer.userId)
          .then(() => {
            console.log('SignalR connected successfully for:', userFromServer.userId);

            this.userSer.markAllMessagesAsDelivered(userFromServer.userId).subscribe({
              next: () => {
                console.log('All messages marked as delivered');
                
                this.userSer.getAllMessagesForUser(userFromServer.userId).subscribe({
                  next: (messages) => {
                    this.userSer.calculateUnreadChats(messages, userFromServer.userId);
                    console.log('Unread chats calculated');
                  },
                  error: (err) => console.error('Error loading messages:', err)
                });

                this.showFloatingMessage('Login successful!', true);

                setTimeout(() => {
                  this.router.navigate(['/home']);
                }, 1000);
              },
              error: (err) => {
                console.error('Error marking messages as delivered:', err);
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

  showFloatingMessage(text: string, success: boolean = true) {
    this.messageText = text;
    this.isSuccess = success;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }
}