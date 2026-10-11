package io.ridemate.carrental.service;

import io.ridemate.carrental.dto.*;
import io.ridemate.carrental.entity.*;
import io.ridemate.carrental.exception.*;
import io.ridemate.carrental.repository.UserRepository;
import io.ridemate.carrental.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().toLowerCase().trim())) {
            throw new ConflictException("An account with email '" + req.getEmail() + "' already exists.");
        }

        Role role = Role.ROLE_CUSTOMER;
        if ("admin".equalsIgnoreCase(req.getRole())) role = Role.ROLE_ADMIN;
        else if ("operations".equalsIgnoreCase(req.getRole())) role = Role.ROLE_OPERATIONS;

        User user = User.builder()
                .name(req.getName().trim())
                .email(req.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .phone(req.getPhone())
                .driverLicenseNumber(req.getDriverLicenseNumber())
                .build();

        User saved = userRepository.save(user);
        String token = jwtTokenProvider.generateTokenFromUsername(saved.getEmail());
        log.info("User registered: {}", saved.getEmail());

        return buildAuthResponse(saved, token);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        String token = jwtTokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user, token);
    }

    @Transactional
    public String forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 999999));
            user.setResetCode(code);
            user.setResetCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);
            log.info("Password reset code generated for: {} -> Code: {}", email, code);
        });
        return "If an account exists, a 6-digit verification code has been dispatched.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ValidationException("Invalid or expired reset code."));

        if (user.getResetCode() == null || !user.getResetCode().equals(req.getCode().trim())) {
            throw new ValidationException("Invalid verification code.");
        }
        if (user.getResetCodeExpiresAt() == null || user.getResetCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Reset code has expired. Please request a new one.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setResetCode(null);
        user.setResetCodeExpiresAt(null);
        userRepository.save(user);
        log.info("Password reset completed for: {}", user.getEmail());
        return "Password has been reset successfully. You can now log in.";
    }

    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        String roleName = user.getRole().name().replace("ROLE_", "").toLowerCase();
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(roleName)
                        .phone(user.getPhone())
                        .driverLicenseNumber(user.getDriverLicenseNumber())
                        .build())
                .build();
    }
}
