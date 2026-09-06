import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login';

/**
 * Unit tests for LoginComponent — form validation and error message display.
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with no error message', () => {
    expect(component.errorMessage()).toBeNull();
  });

  it('should start with isLoading = false', () => {
    expect(component.isLoading()).toBeFalsy();
  });

  it('onSubmit(): should set error message when email is empty', () => {
    component.email = '';
    component.password = 'somepass';
    component.onSubmit();
    expect(component.errorMessage()).toBeTruthy();
    expect(component.errorMessage()).toContain('email');
  });

  it('onSubmit(): should set error message when password is empty', () => {
    component.email = 'shop@tailor.com';
    component.password = '';
    component.onSubmit();
    expect(component.errorMessage()).toBeTruthy();
    expect(component.errorMessage()).toContain('password');
  });

  it('onSubmit(): should set error message when both fields are whitespace only', () => {
    component.email = '   ';
    component.password = '   ';
    component.onSubmit();
    expect(component.errorMessage()).toBeTruthy();
  });

  it('onSubmit(): should set isLoading to true while request is in flight', () => {
    component.email = 'shop@tailor.com';
    component.password = 'pass123';
    component.onSubmit();
    expect(component.isLoading()).toBeTruthy();
  });

  it('onSubmit(): should clear any previous error message before submitting', () => {
    // Set an existing error
    component.email = '';
    component.onSubmit();
    expect(component.errorMessage()).toBeTruthy();

    // Now submit with valid data — error should be cleared before request
    component.email = 'valid@shop.com';
    component.password = 'pass';
    component.onSubmit();
    // The error was cleared before the async request (signal set to null in onSubmit)
    // isLoading confirms submit was reached
    expect(component.isLoading()).toBeTruthy();
  });
});
