import { TestBed } from '@angular/core/testing';
import { ClothingTypesComponent } from './clothing-types';
import { StorageService } from '../../core/services/storage.service';

describe('ClothingTypesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingTypesComponent],
      providers: [StorageService]
    }).compileComponents();
  });

  it('should create the clothing types component', () => {
    const fixture = TestBed.createComponent(ClothingTypesComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
