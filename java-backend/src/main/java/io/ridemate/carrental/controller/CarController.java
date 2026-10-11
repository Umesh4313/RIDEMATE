package io.ridemate.carrental.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.entity.Car;
import io.ridemate.carrental.service.CarService;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/cars", "/api/cars"})
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Car>>> getAllCars(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        List<Car> cars = carService.getAllCars(status, category);
        return ResponseEntity.ok(ApiResponse.success(cars, null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Car>> getCarById(@PathVariable String id) {
        Car car = carService.getCarById(id);
        return ResponseEntity.ok(ApiResponse.success(car, null));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATIONS')")
    public ResponseEntity<ApiResponse<Car>> createCar(@RequestBody Car car) {
        Car created = carService.createCar(car);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Car added to fleet."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATIONS')")
    public ResponseEntity<ApiResponse<Car>> updateCar(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        Car updated = carService.updateCar(id, updates);
        return ResponseEntity.ok(ApiResponse.success(updated, "Car updated."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCar(@PathVariable String id) {
        carService.deleteCar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Car removed from fleet."));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATIONS')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(carService.getStats(), "Fleet statistics retrieved."));
    }
}
