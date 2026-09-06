package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dao.UserDao;
import org.frj.saas.tailor.dto.auth.*;
import org.frj.saas.tailor.dto.user.User;
import org.frj.saas.tailor.service.impl.AuthServiceImpl;
import org.frj.saas.tailor.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Pure unit tests for {@link AuthServiceImpl}.
 *
 * JwtUtil cannot be Mockito-mocked on Java 25 due to bytecode restrictions, so
 * we construct a real JwtUtil with a fixed test secret. All DAO and encoder
 * collaborators are standard Mockito mocks.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserDao userDao;
    @Mock private PasswordEncoder passwordEncoder;

    /** Real JwtUtil with a fixed test secret — avoids Java 25 bytecode restrictions. */
    private JwtUtil jwtUtil;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        // Minimum 32-character secret required by HMAC-SHA256
        jwtUtil = new JwtUtil("test-jwt-secret-key-for-unit-tests-32!!");
        authService = new AuthServiceImpl(userDao, passwordEncoder, jwtUtil);
    }

    // -------------------------------------------------------------------------
    // login()
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("login: valid credentials return AuthResponse with JWT token")
    void login_validCredentials_returnsAuthResponse() {
        User user = buildUser(1L, "shop@tailor.com", "HASHED_PASS", "Shop Owner", "ROLE_TAILOR");
        when(userDao.findByEmail("shop@tailor.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "HASHED_PASS")).thenReturn(true);

        AuthResponse response = authService.login(loginRequest("shop@tailor.com", "secret123"));

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getEmail()).isEqualTo("shop@tailor.com");
        assertThat(response.getFullName()).isEqualTo("Shop Owner");
    }

    @Test
    @DisplayName("login: unknown email throws IllegalArgumentException")
    void login_unknownEmail_throwsIllegalArgument() {
        when(userDao.findByEmail("unknown@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest("unknown@email.com", "any")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    @DisplayName("login: wrong password throws IllegalArgumentException")
    void login_wrongPassword_throwsIllegalArgument() {
        User user = buildUser(1L, "shop@tailor.com", "HASHED_PASS", "Owner", "ROLE_TAILOR");
        when(userDao.findByEmail("shop@tailor.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WRONG", "HASHED_PASS")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest("shop@tailor.com", "WRONG")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");
    }

    // -------------------------------------------------------------------------
    // signup()
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("signup: new email saves user and returns AuthResponse")
    void signup_newEmail_savesUserAndReturnsToken() {
        when(userDao.existsByEmail("new@tailor.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("HASHED_PASS");

        User savedUser = buildUser(5L, "new@tailor.com", "HASHED_PASS", "New Owner", "ROLE_TAILOR");
        when(userDao.save(any(User.class))).thenReturn(savedUser);

        SignupRequest req = signupRequest("new@tailor.com", "pass123", "New Owner", "9876543210");
        AuthResponse response = authService.signup(req);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getId()).isEqualTo(5L);
        verify(userDao).save(any(User.class));
    }

    @Test
    @DisplayName("signup: duplicate email throws IllegalArgumentException — no user saved")
    void signup_duplicateEmail_throwsIllegalArgument() {
        when(userDao.existsByEmail("existing@tailor.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(signupRequest("existing@tailor.com", "pass", "Name", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        verify(userDao, never()).save(any());
    }

    @Test
    @DisplayName("signup: password is stored as bcrypt hash, never as plain-text")
    void signup_passwordStoredHashed() {
        when(userDao.existsByEmail("hashed@tailor.com")).thenReturn(false);
        when(passwordEncoder.encode("plain-text")).thenReturn("$2a$10$HASHED");
        User savedUser = buildUser(2L, "hashed@tailor.com", "$2a$10$HASHED", "Owner", "ROLE_TAILOR");
        when(userDao.save(any(User.class))).thenReturn(savedUser);

        authService.signup(signupRequest("hashed@tailor.com", "plain-text", "Owner", null));

        verify(passwordEncoder).encode("plain-text");
        verify(userDao).save(argThat(u -> "$2a$10$HASHED".equals(u.getPasswordHash())));
    }

    // -------------------------------------------------------------------------
    // resetPassword()
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("resetPassword: valid token updates password, clears token, returns true")
    void resetPassword_validToken_returnsTrue() {
        User user = buildUser(1L, "shop@tailor.com", "OLD_HASH", "Owner", "ROLE_TAILOR");
        user.setResetToken("valid-reset-token");
        when(userDao.findByResetToken("valid-reset-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPass123")).thenReturn("NEW_HASH");

        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("valid-reset-token");
        req.setNewPassword("newPass123");

        boolean result = authService.resetPassword(req);

        assertThat(result).isTrue();
        assertThat(user.getResetToken()).isNull();
        verify(userDao).save(user);
    }

    @Test
    @DisplayName("resetPassword: invalid/expired token returns false — nothing saved")
    void resetPassword_invalidToken_returnsFalse() {
        when(userDao.findByResetToken("bad-token")).thenReturn(Optional.empty());

        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("bad-token");
        req.setNewPassword("anything");

        boolean result = authService.resetPassword(req);

        assertThat(result).isFalse();
        verify(userDao, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private User buildUser(Long id, String email, String hash, String name, String role) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setPasswordHash(hash);
        u.setFullName(name);
        u.setRole(role);
        return u;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    private SignupRequest signupRequest(String email, String password, String name, String mobile) {
        SignupRequest r = new SignupRequest();
        r.setEmail(email);
        r.setPassword(password);
        r.setFullName(name);
        r.setMobileNumber(mobile);
        return r;
    }
}
