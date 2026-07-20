import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private readonly storageService = inject(StorageService);

  readonly stats = this.storageService.stats;
  readonly recentMeasurements = () => this.storageService.measurements().slice(0, 5);
  readonly recentBills = () => this.storageService.bills().slice(0, 5);

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
