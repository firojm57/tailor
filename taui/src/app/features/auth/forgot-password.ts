import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  email = '';
  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.email.trim()) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.successMessage.set(res?.message || 'Password reset request processed. Please check your email.');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to process request. Please try again.');
      }
    });
  }
}
