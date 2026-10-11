package io.ridemate.carrental.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String phone;
    private String driverLicenseNumber;
    private String resetCode;
    private LocalDateTime resetCodeExpiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public User() {
    }

    public User(String id, String name, String email, String passwordHash, Role role, String phone,
                String driverLicenseNumber, String resetCode, LocalDateTime resetCodeExpiresAt,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.phone = phone;
        this.driverLicenseNumber = driverLicenseNumber;
        this.resetCode = resetCode;
        this.resetCodeExpiresAt = resetCodeExpiresAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDriverLicenseNumber() { return driverLicenseNumber; }
    public void setDriverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; }

    public String getResetCode() { return resetCode; }
    public void setResetCode(String resetCode) { this.resetCode = resetCode; }

    public LocalDateTime getResetCodeExpiresAt() { return resetCodeExpiresAt; }
    public void setResetCodeExpiresAt(LocalDateTime resetCodeExpiresAt) { this.resetCodeExpiresAt = resetCodeExpiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String id;
        private String name;
        private String email;
        private String passwordHash;
        private Role role;
        private String phone;
        private String driverLicenseNumber;
        private String resetCode;
        private LocalDateTime resetCodeExpiresAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder driverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; return this; }
        public UserBuilder resetCode(String resetCode) { this.resetCode = resetCode; return this; }
        public UserBuilder resetCodeExpiresAt(LocalDateTime resetCodeExpiresAt) { this.resetCodeExpiresAt = resetCodeExpiresAt; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            return new User(id, name, email, passwordHash, role, phone, driverLicenseNumber, resetCode, resetCodeExpiresAt, createdAt, updatedAt);
        }
    }
}
