import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

/**
 * Unit tests for AuthService.
 * All HTTP calls are intercepted by HttpTestingController — no real network requests.
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated() should be false when no token is stored', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('login(): should POST credentials and store token on success', () => {
    const fakeResponse = {
      token: 'fake.jwt.token',
      id: 1,
      fullName: 'Shop Owner',
      email: 'shop@tailor.com',
      role: 'ROLE_TAILOR'
    };

    let receivedResponse: any;
    service.login({ email: 'shop@tailor.com', password: 'pass123' }).subscribe(res => {
      receivedResponse = res;
    });

    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(fakeResponse);

    expect(receivedResponse?.token).toBe('fake.jwt.token');
    expect(service.isAuthenticated()).toBeTruthy();
    expect(service.token()).toBe('fake.jwt.token');
    expect(localStorage.getItem('tailor_auth_token')).toBe('fake.jwt.token');
  });

  it('login(): should NOT update token state when server returns error', () => {
    let errorOccurred = false;
    service.login({ email: 'bad@mail.com', password: 'wrong' }).subscribe({
      error: () => { errorOccurred = true; }
    });

    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    req.flush({ error: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    expect(errorOccurred).toBeTruthy();
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.token()).toBeNull();
  });

  it('signup(): should POST and store user on success', () => {
    const fakeResponse = {
      token: 'new.jwt.token',
      id: 2,
      fullName: 'New User',
      email: 'new@tailor.com',
      role: 'ROLE_TAILOR'
    };

    let receivedEmail: string | undefined;
    service.signup({ email: 'new@tailor.com', password: 'pass', fullName: 'New User' }).subscribe(res => {
      receivedEmail = res.email;
    });

    const req = httpMock.expectOne(r => r.url.includes('/auth/signup'));
    expect(req.request.method).toBe('POST');
    req.flush(fakeResponse);

    expect(receivedEmail).toBe('new@tailor.com');
    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('currentUser() should reflect user data returned from login', () => {
    const fakeResponse = {
      token: 'tok',
      id: 3,
      fullName: 'Test Tailor',
      email: 'test@tailor.com',
      role: 'ROLE_TAILOR'
    };

    service.login({ email: 'test@tailor.com', password: 'abc' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    req.flush(fakeResponse);

    const user = service.currentUser();
    expect(user?.fullName).toBe('Test Tailor');
    expect(user?.email).toBe('test@tailor.com');
  });

  it('logout(): should clear stored token from localStorage', () => {
    // Pre-seed token via a login
    const fakeResponse = { token: 'tok', id: 1, fullName: 'Owner', email: 'o@shop.com', role: 'ROLE_TAILOR' };
    service.login({ email: 'o@shop.com', password: 'p' }).subscribe();
    httpMock.expectOne(r => r.url.includes('/auth/login')).flush(fakeResponse);
    expect(localStorage.getItem('tailor_auth_token')).toBe('tok');

    service.logout();
    httpMock.expectOne(r => r.url.includes('/auth/logout')).flush({});

    expect(localStorage.getItem('tailor_auth_token')).toBeNull();
  });
});
