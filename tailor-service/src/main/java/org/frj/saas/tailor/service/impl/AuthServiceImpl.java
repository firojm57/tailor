package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.UserDao;
import org.frj.saas.tailor.dto.auth.*;
import org.frj.saas.tailor.dto.user.User;
import org.frj.saas.tailor.service.AuthService;
import org.frj.saas.tailor.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserDao userDao, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public AuthResponse signup(SignupRequest request) {
        log.debug("AuthService: Checking email uniqueness for {}", request.getEmail());
        if (userDao.existsByEmail(request.getEmail())) {
            log.warn("AuthService: Signup rejected - user with email {} already exists", request.getEmail());
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMobileNumber(request.getMobileNumber());
        user.setRole("ROLE_TAILOR");

        User saved = userDao.save(user);
        log.info("AuthService: Saved new user to DB with id: {}, email: {}", saved.getId(), saved.getEmail());

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole());
        return new AuthResponse(token, saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.debug("AuthService: Validating user credentials for email {}", request.getEmail());
        User user = userDao.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("AuthService: Login failed - email {} not found", request.getEmail());
                    return new IllegalArgumentException("Invalid email or password.");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("AuthService: Login failed - password mismatch for email {}", request.getEmail());
            throw new IllegalArgumentException("Invalid email or password.");
        }

        log.info("AuthService: Authenticated user id: {}, email: {}", user.getId(), user.getEmail());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        log.debug("AuthService: Generating password reset token for email {}", request.getEmail());
        Optional<User> userOpt = userDao.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1).toString());
            userDao.save(user);
            log.info("AuthService: Issued reset token for user id: {}", user.getId());
            return resetToken;
        }
        log.info("AuthService: Forgot password request ignored - email {} not registered", request.getEmail());
        return null;
    }

    @Override
    public boolean resetPassword(ResetPasswordRequest request) {
        log.debug("AuthService: Validating password reset token");
        Optional<User> userOpt = userDao.findByResetToken(request.getToken());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userDao.save(user);
            log.info("AuthService: Updated password for user id: {}", user.getId());
            return true;
        }
        log.warn("AuthService: Invalid or expired reset token provided");
        return false;
    }
}
