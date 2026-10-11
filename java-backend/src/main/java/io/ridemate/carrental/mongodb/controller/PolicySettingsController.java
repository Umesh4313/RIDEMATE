package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.document.PolicySettingsDocument;
import io.ridemate.carrental.mongodb.service.PolicySettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/policies", "/api/policies"})
@Tag(name = "Cancellation Policies & Charges", description = "Endpoints for managing cancellation deadlines, fees, and extra service charges")
public class PolicySettingsController {

    private final PolicySettingsService policySettingsService;

    public PolicySettingsController(PolicySettingsService policySettingsService) {
        this.policySettingsService = policySettingsService;
    }

    @GetMapping
    @Operation(summary = "Get active cancellation policies and surcharge settings")
    public ResponseEntity<ApiResponse<PolicySettingsDocument>> getPolicies() {
        PolicySettingsDocument doc = policySettingsService.getActivePolicySettings();
        return ResponseEntity.ok(ApiResponse.success(doc, "Active cancellation policies loaded."));
    }

    @PutMapping
    @Operation(summary = "Update cancellation policies and surcharge settings")
    public ResponseEntity<ApiResponse<PolicySettingsDocument>> updatePolicies(
            @RequestBody PolicySettingsDocument req,
            @RequestParam(required = false) String reason,
            Authentication auth) {
        String actor = auth != null ? auth.getName() : "admin@ridemate.io";
        PolicySettingsDocument updated = policySettingsService.updatePolicySettings(req, actor, reason);
        return ResponseEntity.ok(ApiResponse.success(updated, "Policies successfully updated in MongoDB."));
    }
}
