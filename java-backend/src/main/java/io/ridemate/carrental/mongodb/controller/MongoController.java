package io.ridemate.carrental.mongodb.controller;

import io.ridemate.carrental.dto.ApiResponse;
import io.ridemate.carrental.mongodb.service.MongoStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/mongo", "/api/mongo"})
@Tag(name = "MongoDB Health & Stats", description = "Monitor MongoDB document store connection, collections, and document counts")
public class MongoController {

    private final MongoStatusService mongoStatusService;

    public MongoController(MongoStatusService mongoStatusService) {
        this.mongoStatusService = mongoStatusService;
    }

    @GetMapping("/status")
    @Operation(summary = "MongoDB cluster status", description = "Returns active MongoDB connection health, latency, collections, and document counts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMongoStatus() {
        Map<String, Object> status = mongoStatusService.getMongoStatus();
        return ResponseEntity.ok(ApiResponse.success(status, "MongoDB status report"));
    }
}
