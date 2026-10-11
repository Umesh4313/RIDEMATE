package io.ridemate.carrental.mongodb.controller;
import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.dto.CustomerLoyaltyResponse;
import io.ridemate.carrental.mongodb.service.CustomerLoyaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/loyalty", "/api/loyalty"})
@Tag(name = "Customer Loyalty", description = "Endpoints for customer loyalty tiers, discount eligibility, and rewards")
public class LoyaltyController {

    private final CustomerLoyaltyService loyaltyService;

    public LoyaltyController(CustomerLoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/status")
    @Operation(summary = "Get customer loyalty and discount status", description = "Determines whether user is first-time (10% off) or regular (15% off) with points")
    public ResponseEntity<ApiResponse<CustomerLoyaltyResponse>> getLoyaltyStatus(
            @RequestParam(required = false) String customerEmail,
            @RequestParam(required = false) String customerName) {
        CustomerLoyaltyResponse resp = loyaltyService.getCustomerLoyalty(customerEmail, customerName);
        return ResponseEntity.ok(ApiResponse.success(resp, "Customer loyalty status retrieved successfully."));
    }
}
