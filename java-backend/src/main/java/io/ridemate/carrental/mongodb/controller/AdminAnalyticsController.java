package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.dto.AdminAnalyticsDto;
import io.ridemate.carrental.mongodb.service.AdminAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/v1/admin/analytics", "/api/admin/analytics"})
@Tag(name = "Profit & Financial Analytics", description = "Endpoints for monthly and yearly financial breakdown, net profit, and zero-activity reconciliation")
public class AdminAnalyticsController {

    private final AdminAnalyticsService analyticsService;

    public AdminAnalyticsController(AdminAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @Operation(summary = "Get financial analytics by year and optional month",
               description = "Returns summary metrics and full 12-month series from MongoDB bookings, reconciling zero-booking periods")
    public ResponseEntity<ApiResponse<AdminAnalyticsDto>> getAnalytics(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int targetYear = (year != null && year >= 2024 && year <= 2035) ? year : LocalDate.now().getYear();
        Integer targetMonth = (month != null && month >= 1 && month <= 12) ? month : null;

        AdminAnalyticsDto analytics = analyticsService.getFinancialAnalytics(targetYear, targetMonth);
        return ResponseEntity.ok(ApiResponse.success(analytics, "Financial analytics computed from MongoDB."));
    }
}
