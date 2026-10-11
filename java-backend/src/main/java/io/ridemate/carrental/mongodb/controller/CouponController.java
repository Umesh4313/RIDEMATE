package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.dto.*;
import io.ridemate.carrental.mongodb.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/coupons", "/api/coupons"})
@Tag(name = "Coupons & Discounts", description = "Endpoints for dynamic coupon selection and validation based on MongoDB booking history")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate promo code", description = "Validates coupon eligibility against customer booking history in MongoDB and computes price breakdown")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest req,
            Authentication authentication) {
        if ((req.getCustomerEmail() == null || req.getCustomerEmail().isBlank()) && authentication != null) {
            req.setCustomerEmail(authentication.getName());
        }
        CouponValidationResponse resp = couponService.validateCoupon(req);
        if (!resp.isValid()) {
            return ResponseEntity.ok(ApiResponse.error(resp.getMessage(), resp));
        }
        return ResponseEntity.ok(ApiResponse.success(resp, resp.getMessage()));
    }

    @GetMapping({"", "/", "/available"})
    @Operation(summary = "Get available coupons for user", description = "Returns dynamic coupons matching customer booking history: NEWREG10 (10%) for new, EXISTING5 (5%) for existing")
    public ResponseEntity<ApiResponse<List<CouponSummaryDto>>> getAvailableCoupons(
            @RequestParam(required = false) String customerEmail,
            Authentication authentication) {
        String effectiveEmail = customerEmail;
        if ((effectiveEmail == null || effectiveEmail.isBlank()) && authentication != null) {
            effectiveEmail = authentication.getName();
        }
        List<CouponSummaryDto> coupons = couponService.getAvailableCoupons(effectiveEmail);
        return ResponseEntity.ok(ApiResponse.success(coupons, "Available promotions loaded based on MongoDB booking history."));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active platform promotions")
    public ResponseEntity<ApiResponse<List<CouponSummaryDto>>> getAllActive(
            @RequestParam(required = false) String customerEmail,
            Authentication authentication) {
        String effectiveEmail = customerEmail;
        if ((effectiveEmail == null || effectiveEmail.isBlank()) && authentication != null) {
            effectiveEmail = authentication.getName();
        }
        List<CouponSummaryDto> coupons = couponService.getAvailableCoupons(effectiveEmail != null ? effectiveEmail : "");
        return ResponseEntity.ok(ApiResponse.success(coupons, "Active coupons retrieved."));
    }
}
