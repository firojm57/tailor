import { TestBed } from '@angular/core/testing';
import { BillingComponent } from './billing';
import { StorageService } from '../../core/services/storage.service';

describe('BillingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingComponent],
      providers: [StorageService]
    }).compileComponents();
  });

  it('should create the billing component', () => {
    const fixture = TestBed.createComponent(BillingComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
