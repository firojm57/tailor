import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { StorageService } from '../../core/services/storage.service';
import { provideRouter } from '@angular/router';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        StorageService,
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the dashboard', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
