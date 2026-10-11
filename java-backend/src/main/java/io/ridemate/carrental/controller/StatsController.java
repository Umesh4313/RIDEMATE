package io.ridemate.carrental.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.service.CarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/stats", "/api/stats"})
public class StatsController {

    private final CarService carService;

    public StatsController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATIONS')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFleetStats() {
        return ResponseEntity.ok(ApiResponse.success(carService.getStats(), "Fleet stats retrieved."));
    }
}
