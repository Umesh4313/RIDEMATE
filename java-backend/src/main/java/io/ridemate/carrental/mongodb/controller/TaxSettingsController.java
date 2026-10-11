package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.document.TaxSettingsDocument;
import io.ridemate.carrental.mongodb.service.TaxSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/tax-settings", "/api/tax-settings"})
@Tag(name = "GST & Tax Settings", description = "Endpoints for configuring dynamic GST rates, tax categories, and review audit trail")
public class TaxSettingsController {

    private final TaxSettingsService taxSettingsService;

    public TaxSettingsController(TaxSettingsService taxSettingsService) {
        this.taxSettingsService = taxSettingsService;
    }

    @GetMapping
    @Operation(summary = "Get active GST and tax settings")
    public ResponseEntity<ApiResponse<TaxSettingsDocument>> getTaxSettings() {
        TaxSettingsDocument settings = taxSettingsService.getActiveTaxSettings();
        return ResponseEntity.ok(ApiResponse.success(settings, "Active GST and tax settings retrieved."));
    }

    @PutMapping
    @Operation(summary = "Update GST rate and tax categories",
               description = "Applies new rate to future bookings while preserving historical booking tax calculations")
    public ResponseEntity<ApiResponse<TaxSettingsDocument>> updateTaxSettings(
            @RequestBody TaxSettingsDocument req,
            @RequestParam(required = false) String reason,
            Authentication auth) {
        String actor = auth != null ? auth.getName() : "admin@ridemate.io";
        TaxSettingsDocument updated = taxSettingsService.updateTaxSettings(req, actor, reason);
        return ResponseEntity.ok(ApiResponse.success(updated, "GST and tax settings successfully updated in MongoDB."));
    }
}
