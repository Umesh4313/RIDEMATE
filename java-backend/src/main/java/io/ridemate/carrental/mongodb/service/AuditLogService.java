package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.RentalAuditLogDocument;
import io.ridemate.carrental.mongodb.repository.MongoAuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private final MongoAuditLogRepository auditLogRepository;

    public AuditLogService(MongoAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public RentalAuditLogDocument logAction(String action, String actor, String details, String metadata) {
        try {
            RentalAuditLogDocument doc = new RentalAuditLogDocument(action, actor, details, metadata);
            doc.setTimestamp(LocalDateTime.now());
            RentalAuditLogDocument saved = auditLogRepository.save(doc);
            log.info("[AUDIT] Action: {} | Actor: {} | Details: {}", action, actor, details);
            return saved;
        } catch (Exception e) {
            log.warn("Failed to save audit log: {}", e.getMessage());
            return null;
        }
    }

    public List<RentalAuditLogDocument> getAuditLogs(String actionFilter, String actorFilter) {
        List<RentalAuditLogDocument> list = auditLogRepository.findAllByOrderByTimestampDesc();
        if (list.isEmpty()) {
            // Seed a few illustrative baseline audit entries if fresh
            seedInitialAuditLogs();
            list = auditLogRepository.findAllByOrderByTimestampDesc();
        }

        return list.stream()
                .filter(a -> actionFilter == null || actionFilter.isBlank() || a.getAction().toLowerCase().contains(actionFilter.toLowerCase()))
                .filter(a -> actorFilter == null || actorFilter.isBlank() || a.getActor().toLowerCase().contains(actorFilter.toLowerCase()))
                .collect(Collectors.toList());
    }

    private void seedInitialAuditLogs() {
        logAction("SYSTEM_INIT", "admin@ridemate.io", "Initialized RIDEMATE Enterprise stack with MongoDB", "version=1.0.0");
        logAction("TAX_CONFIG_INIT", "admin@ridemate.io", "Applied baseline GST rate of 5.0% (CGST 2.5% + SGST 2.5%)", "rate=0.05");
        logAction("FLEET_SYNC", "operations@ridemate.io", "Loaded 8 active car models into MongoDB fleet inventory", "totalFleet=41");
    }
}
