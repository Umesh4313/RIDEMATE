package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.document.MongoCarInventoryDocument;
import io.ridemate.carrental.mongodb.dto.CarAvailabilityDto;
import io.ridemate.carrental.mongodb.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/inventory", "/api/inventory"})
@Tag(name = "Car Inventory & Live Availability", description = "Endpoints for MongoDB-backed fleet management and real-time date-based vehicle availability")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping({"", "/", "/availability"})
    @Operation(summary = "Get date-based availability for all car models", 
               description = "Calculates available fleet = Total - Maintenance - Overlapping Bookings for the selected rental period")
    public ResponseEntity<ApiResponse<List<CarAvailabilityDto>>> getAvailability(
            @RequestParam(required = false) String pickupDate,
            @RequestParam(required = false) String dropoffDate) {
        List<CarAvailabilityDto> availabilityList = inventoryService.getAvailabilityForPeriod(pickupDate, dropoffDate);
        return ResponseEntity.ok(ApiResponse.success(availabilityList, "Live inventory availability loaded successfully."));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get availability for a specific car model for dates")
    public ResponseEntity<ApiResponse<CarAvailabilityDto>> getCarAvailability(
            @PathVariable String id,
            @RequestParam(required = false) String pickupDate,
            @RequestParam(required = false) String dropoffDate) {
        CarAvailabilityDto dto = inventoryService.getCarAvailability(id, pickupDate, dropoffDate);
        return ResponseEntity.ok(ApiResponse.success(dto, "Car availability calculated."));
    }

    @PutMapping("/{id}/fleet-quantity")
    @Operation(summary = "Admin: Update total fleet quantity for a car model",
               description = "Validates that fleet quantity cannot be lower than existing active confirmed bookings")
    public ResponseEntity<ApiResponse<MongoCarInventoryDocument>> updateFleetQuantity(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        int quantity;
        if (payload.containsKey("quantity")) {
            quantity = ((Number) payload.get("quantity")).intValue();
        } else if (payload.containsKey("totalFleetQuantity")) {
            quantity = ((Number) payload.get("totalFleetQuantity")).intValue();
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing 'quantity' or 'totalFleetQuantity' in body", null));
        }

        try {
            MongoCarInventoryDocument updated = inventoryService.updateFleetQuantity(id, quantity);
            return ResponseEntity.ok(ApiResponse.success(updated, "Fleet quantity successfully updated in MongoDB."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage(), null));
        }
    }

    @PutMapping("/{id}/vehicle-status")
    @Operation(summary = "Admin: Toggle vehicle operational/maintenance status")
    public ResponseEntity<ApiResponse<MongoCarInventoryDocument>> setVehicleMaintenance(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        String regNumber = (String) payload.get("registrationNumber");
        Boolean inMaintenance = (Boolean) payload.get("inMaintenance");

        if (regNumber == null || inMaintenance == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Both 'registrationNumber' and 'inMaintenance' boolean required.", null));
        }

        try {
            MongoCarInventoryDocument updated = inventoryService.setVehicleMaintenance(id, regNumber, inMaintenance);
            return ResponseEntity.ok(ApiResponse.success(updated, "Vehicle maintenance status updated."));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage(), null));
        }
    }

    @PostMapping("/seed")
    @Operation(summary = "Seed default MongoDB vehicle inventory")
    public ResponseEntity<ApiResponse<List<MongoCarInventoryDocument>>> seedInventory() {
        List<MongoCarInventoryDocument> seeded = inventoryService.seedDefaultInventory();
        return ResponseEntity.ok(ApiResponse.success(seeded, "Default MongoDB fleet inventory initialized."));
    }
}
