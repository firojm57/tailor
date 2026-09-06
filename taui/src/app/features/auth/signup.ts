import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html'
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  mobileNumber = '';
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Please fill out all required fields.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      mobileNumber: this.mobileNumber
    };

    this.authService.signup(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.storageService.refreshData();
        this.storageService.showToast('Account registered successfully! Welcome aboard.', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.error || 'Registration failed. Please check your information.';
        this.errorMessage.set(msg);
      }
    });
  }
}
