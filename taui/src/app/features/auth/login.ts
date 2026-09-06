import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Please enter both email address and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.storageService.refreshData();
        this.storageService.showToast('Welcome back! Successfully logged in.', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        let msg: string;
        if (err.status === 401 || err.status === 400) {
          msg = err?.error?.error || 'Invalid email address or password. Please check your credentials and try again.';
        } else if (err.status === 503) {
          msg = 'The service is temporarily unavailable. Please wait a moment and try again.';
        } else if (err.status === 0) {
          msg = 'Unable to connect to the server. Please ensure the application is running and try again.';
        } else {
          msg = err?.error?.error || 'Sign-in could not be completed at this time. Please try again in a moment.';
        }
        this.errorMessage.set(msg);
      }
    });
  }
}
