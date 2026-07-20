import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from './core/services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly storageService = inject(StorageService);

  readonly isSidebarOpen = signal<boolean>(false);
  readonly isProfileDropdownOpen = signal<boolean>(false);

  readonly globalSearchQuery = this.storageService.globalSearchQuery;

  readonly tailorName = 'Ahmed Khan';
  readonly tailorRole = 'Master Tailor';

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen.update(v => !v);
  }
}
