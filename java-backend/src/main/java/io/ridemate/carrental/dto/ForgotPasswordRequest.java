package io.ridemate.carrental.dto;

import jakarta.validation.constraints.*;

public class ForgotPasswordRequest {
    @Email @NotBlank
    private String email;

    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
