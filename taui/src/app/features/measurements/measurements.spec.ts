import { TestBed } from '@angular/core/testing';
import { MeasurementsComponent } from './measurements';
import { StorageService } from '../../core/services/storage.service';

describe('MeasurementsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementsComponent],
      providers: [StorageService]
    }).compileComponents();
  });

  it('should create the measurements component', () => {
    const fixture = TestBed.createComponent(MeasurementsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
