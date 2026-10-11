package io.ridemate.carrental.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UserInfo user;

    public AuthResponse() {}

    public AuthResponse(String token, String tokenType, UserInfo user) {
        this.token = token;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String tokenType = "Bearer";
        private UserInfo user;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public AuthResponseBuilder user(UserInfo user) { this.user = user; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, tokenType, user);
        }
    }

    public static class UserInfo {
        private String id;
        private String name;
        private String email;
        private String role;
        private String phone;
        private String driverLicenseNumber;

        public UserInfo() {}

        public UserInfo(String id, String name, String email, String role, String phone, String driverLicenseNumber) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.phone = phone;
            this.driverLicenseNumber = driverLicenseNumber;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getDriverLicenseNumber() { return driverLicenseNumber; }
        public void setDriverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; }

        public static UserInfoBuilder builder() {
            return new UserInfoBuilder();
        }

        public static class UserInfoBuilder {
            private String id;
            private String name;
            private String email;
            private String role;
            private String phone;
            private String driverLicenseNumber;

            public UserInfoBuilder id(String id) { this.id = id; return this; }
            public UserInfoBuilder name(String name) { this.name = name; return this; }
            public UserInfoBuilder email(String email) { this.email = email; return this; }
            public UserInfoBuilder role(String role) { this.role = role; return this; }
            public UserInfoBuilder phone(String phone) { this.phone = phone; return this; }
            public UserInfoBuilder driverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; return this; }

            public UserInfo build() {
                return new UserInfo(id, name, email, role, phone, driverLicenseNumber);
            }
        }
    }
}
