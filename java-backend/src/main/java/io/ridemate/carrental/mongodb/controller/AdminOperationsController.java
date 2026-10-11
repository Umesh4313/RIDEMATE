package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import io.ridemate.carrental.mongodb.dto.CustomerProfileDto;
import io.ridemate.carrental.mongodb.service.AdminOperationsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@Tag(name = "Admin Operations", description = "Endpoints for managing customer profiles, unified bookings, vouchers, and payment records")
public class AdminOperationsController {

    private final AdminOperationsService operationsService;

    public AdminOperationsController(AdminOperationsService operationsService) {
        this.operationsService = operationsService;
    }

    @GetMapping("/customers")
    @Operation(summary = "Get aggregated customer profiles with booking summaries")
    public ResponseEntity<ApiResponse<List<CustomerProfileDto>>> getCustomers(
            @RequestParam(required = false) String search) {
        List<CustomerProfileDto> customers = operationsService.getCustomers(search);
        return ResponseEntity.ok(ApiResponse.success(customers, "Customer profiles loaded from MongoDB."));
    }

    @GetMapping("/customers/{email}/bookings")
    @Operation(summary = "Get full booking history for a specific customer")
    public ResponseEntity<ApiResponse<List<MongoBookingDocument>>> getCustomerBookings(
            @PathVariable String email) {
        List<MongoBookingDocument> bookings = operationsService.getCustomerBookings(email);
        return ResponseEntity.ok(ApiResponse.success(bookings, "Customer bookings loaded."));
    }

    @GetMapping("/vouchers")
    @Operation(summary = "Get all official generated rental vouchers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGeneratedVouchers(
            @RequestParam(required = false) String search) {
        List<Map<String, Object>> vouchers = operationsService.getGeneratedVouchers(search);
        return ResponseEntity.ok(ApiResponse.success(vouchers, "Generated vouchers retrieved."));
    }

    @GetMapping("/payments")
    @Operation(summary = "Get all customer transaction and payment records")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPaymentRecords(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        List<Map<String, Object>> payments = operationsService.getPaymentRecords(search, status);
        return ResponseEntity.ok(ApiResponse.success(payments, "Payment records retrieved."));
    }
}
