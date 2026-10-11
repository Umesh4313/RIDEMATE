package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.PolicySettingsDocument;
import io.ridemate.carrental.mongodb.repository.PolicySettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PolicySettingsService {

    private static final Logger log = LoggerFactory.getLogger(PolicySettingsService.class);
    private static final String DEFAULT_CONFIG_ID = "active_policy_config";

    private final PolicySettingsRepository policySettingsRepository;
    private final AuditLogService auditLogService;

    public PolicySettingsService(PolicySettingsRepository policySettingsRepository, AuditLogService auditLogService) {
        this.policySettingsRepository = policySettingsRepository;
        this.auditLogService = auditLogService;
    }

    public PolicySettingsDocument getActivePolicySettings() {
        return policySettingsRepository.findById(DEFAULT_CONFIG_ID).orElseGet(() -> {
            PolicySettingsDocument doc = new PolicySettingsDocument();
            doc.setId(DEFAULT_CONFIG_ID);
            doc.setUpdatedBy("system");
            doc.setUpdatedAt(LocalDateTime.now());
            return policySettingsRepository.save(doc);
        });
    }

    public PolicySettingsDocument updatePolicySettings(PolicySettingsDocument updateReq, String updatedBy, String reason) {
        PolicySettingsDocument current = getActivePolicySettings();

        current.setLateReturnFeePerHour(updateReq.getLateReturnFeePerHour());
        current.setSecurityDepositAmount(updateReq.getSecurityDepositAmount());
        current.setSecurityDepositEnabled(updateReq.isSecurityDepositEnabled());
        if (updateReq.getSecurityDepositType() != null) {
            current.setSecurityDepositType(updateReq.getSecurityDepositType());
        }
        if (updateReq.getCancellationTiers() != null && !updateReq.getCancellationTiers().isEmpty()) {
            current.setCancellationTiers(updateReq.getCancellationTiers());
        }
        if (updateReq.getAdditionalCharges() != null && !updateReq.getAdditionalCharges().isEmpty()) {
            current.setAdditionalCharges(updateReq.getAdditionalCharges());
        }

        String effectiveActor = updatedBy != null && !updatedBy.isBlank() ? updatedBy : "admin@ridemate.io";
        current.setUpdatedBy(effectiveActor);
        current.setUpdatedAt(LocalDateTime.now());

        PolicySettingsDocument saved = policySettingsRepository.save(current);

        auditLogService.logAction(
                "POLICY_SETTINGS_UPDATED",
                effectiveActor,
                "Updated cancellation policy tiers and additional charge surcharges",
                String.format("lateFee=%.2f,tiers=%d,reason=%s", saved.getLateReturnFeePerHour(), saved.getCancellationTiers().size(), reason != null ? reason : "Standard policy refresh")
        );

        log.info("Admin updated cancellation policies and additional charges by {}", effectiveActor);
        return saved;
    }
}
