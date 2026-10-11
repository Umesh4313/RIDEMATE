package io.ridemate.carrental.controller;

import io.ridemate.carrental.dto.*;
import io.ridemate.carrental.entity.User;
import io.ridemate.carrental.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse result = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "User registered successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse result = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success(result, "Login successful."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String msg = authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(ApiResponse.success(msg, msg));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        String msg = authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success(msg, msg));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getProfile(userDetails.getUsername());
        String roleName = user.getRole().name().replace("ROLE_", "").toLowerCase();
        AuthResponse.UserInfo info = AuthResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(roleName)
                .phone(user.getPhone())
                .driverLicenseNumber(user.getDriverLicenseNumber())
                .build();
        return ResponseEntity.ok(ApiResponse.success(info, "User profile retrieved."));
    }
}
