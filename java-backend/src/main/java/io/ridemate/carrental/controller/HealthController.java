package io.ridemate.carrental.controller;

import io.ridemate.carrental.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "service", "RIDEMATE Java Backend API",
                "version", "1.0.0",
                "status", "online",
                "language", "Java 17 + Spring Boot 3.3",
                "timestamp", LocalDateTime.now().toString(),
                "endpoints", Map.of(
                        "auth", "/api/v1/auth",
                        "cars", "/api/v1/cars",
                        "bookings", "/api/v1/bookings",
                        "stats", "/api/v1/stats"
                )
        ), "RIDEMATE Backend is healthy and running.");
    }
}
