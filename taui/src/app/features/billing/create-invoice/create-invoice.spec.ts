import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CreateInvoiceComponent } from './create-invoice';
import { StorageService } from '../../../core/services/storage.service';
import { routes } from '../../../app.routes';

describe('CreateInvoiceComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateInvoiceComponent],
      providers: [
        StorageService,
        provideHttpClient(),
        provideRouter(routes)
      ]
    }).compileComponents();
  });

  it('should create the create invoice component', () => {
    const fixture = TestBed.createComponent(CreateInvoiceComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
