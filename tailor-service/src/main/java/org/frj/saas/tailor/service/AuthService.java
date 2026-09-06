package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dto.auth.*;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
    String forgotPassword(ForgotPasswordRequest request);
    boolean resetPassword(ResetPasswordRequest request);
}
