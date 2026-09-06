import { Component, signal, inject, HostListener, computed } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from './core/services/storage.service';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  children?: { label: string; route: string; icon: string; exact?: boolean }[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly storageService = inject(StorageService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSidebarOpen = signal<boolean>(false);
  readonly isProfileDropdownOpen = signal<boolean>(false);
  readonly isBillingSubmenuOpen = signal<boolean>(true);

  readonly pageTitle = signal<string>('Dashboard');

  readonly tailorName = computed(() => this.authService.currentUser()?.fullName || 'Shop Master');
  readonly tailorRole = computed(() => this.authService.currentUser()?.role === 'ROLE_ADMIN' ? 'Admin' : 'Master Tailor');


  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'bx-grid-alt', exact: true },
    { label: 'Measurements', route: '/measurements', icon: 'bx-ruler' },
    { 
      label: 'Billing & Invoices', 
      route: '/billing', 
      icon: 'bx-receipt',
      children: [
        { label: 'Invoice Registry', route: '/billing', icon: 'bx-list-ul', exact: true },
        { label: 'Create Invoice', route: '/billing/create', icon: 'bx-plus-circle' }
      ]
    },
    { label: 'Clothing Types', route: '/clothing-types', icon: 'bx-closet' }
  ];

  readonly isAuthPage = signal<boolean>(false);

  constructor() {
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.updateTitle(e.urlAfterRedirects || e.url);
    });
  }

  private updateTitle(url: string): void {
    const isAuth = url.includes('/login') || url.includes('/signup') || url.includes('/forgot-password');
    this.isAuthPage.set(isAuth);

    if (url.includes('/billing/create')) {
      this.pageTitle.set('Create New Invoice');
    } else if (url.includes('/measurements')) {
      this.pageTitle.set('Customer Measurements');
    } else if (url.includes('/clothing-types')) {
      this.pageTitle.set('Clothing Types');
    } else if (url.includes('/billing')) {
      this.pageTitle.set('Billing & Invoices');
    } else {
      this.pageTitle.set('Dashboard');
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  toggleBillingSubmenu(): void {
    this.isBillingSubmenuOpen.update(v => !v);
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen.update(v => !v);
  }

  logout(): void {
    this.isProfileDropdownOpen.set(false);
    this.authService.logout();
    this.storageService.showToast('Logged out successfully.', 'info');
    this.router.navigate(['/login']);
  }

  @HostListener('document:keydown.escape')
  handleKeydownEscape(): void {
    if (this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
    if (this.isProfileDropdownOpen()) {
      this.isProfileDropdownOpen.set(false);
    }
  }
}

