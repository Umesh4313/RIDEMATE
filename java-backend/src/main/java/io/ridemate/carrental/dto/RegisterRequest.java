package io.ridemate.carrental.dto;

import jakarta.validation.constraints.*;

public class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone;
    private String driverLicenseNumber;
    private String role; // admin, operations, customer

    public RegisterRequest() {}

    public RegisterRequest(String name, String email, String password, String phone, String driverLicenseNumber, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.driverLicenseNumber = driverLicenseNumber;
        this.role = role;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDriverLicenseNumber() { return driverLicenseNumber; }
    public void setDriverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
