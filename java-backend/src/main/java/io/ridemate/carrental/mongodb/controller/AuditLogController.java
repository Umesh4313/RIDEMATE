package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.document.RentalAuditLogDocument;
import io.ridemate.carrental.mongodb.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/admin/audit-logs", "/api/admin/audit-logs"})
@Tag(name = "Admin Audit Logs", description = "Query historical administrative operations and compliance events")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @Operation(summary = "Get admin audit logs with filtering")
    public ResponseEntity<ApiResponse<List<RentalAuditLogDocument>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String actor) {
        List<RentalAuditLogDocument> logs = auditLogService.getAuditLogs(action, actor);
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved successfully."));
    }

    @PostMapping
    @Operation(summary = "Record custom administrative audit event")
    public ResponseEntity<ApiResponse<RentalAuditLogDocument>> logAuditEvent(
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        String actor = auth != null ? auth.getName() : "admin@ridemate.io";
        String action = payload.getOrDefault("action", "ADMIN_ACTION");
        String details = payload.getOrDefault("details", "Administrative operation performed");
        String metadata = payload.getOrDefault("metadata", "");

        RentalAuditLogDocument doc = auditLogService.logAction(action, actor, details, metadata);
        return ResponseEntity.ok(ApiResponse.success(doc, "Audit event recorded."));
    }
}
