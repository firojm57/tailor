package org.frj.saas.tailor.controller;

import org.frj.saas.tailor.dto.auth.AuthResponse;
import org.frj.saas.tailor.dto.auth.ForgotPasswordRequest;
import org.frj.saas.tailor.dto.auth.LoginRequest;
import org.frj.saas.tailor.dto.auth.ResetPasswordRequest;
import org.frj.saas.tailor.dto.auth.SignupRequest;
import org.frj.saas.tailor.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        log.debug("Received signup request for email: {}", request.getEmail());
        AuthResponse response = authService.signup(request);
        log.info("User registered successfully: {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.debug("Received login attempt for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            log.info("User logged in successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Authentication failed for email {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        log.debug("Password reset requested for email: {}", request.getEmail());
        String resetToken = authService.forgotPassword(request);
        if (resetToken != null) {
            log.info("Password reset token generated for email: {}", request.getEmail());
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset instructions generated.",
                    "resetToken", resetToken
            ));
        }
        log.info("Password reset requested for non-existent email: {}", request.getEmail());
        return ResponseEntity.ok(Map.of("message", "If account exists, password reset details have been created."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        log.debug("Processing password reset with token");
        boolean success = authService.resetPassword(request);
        if (success) {
            log.info("Password reset successfully completed");
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        }
        log.warn("Password reset failed due to invalid/expired token");
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset token."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("User session logged out");
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}
