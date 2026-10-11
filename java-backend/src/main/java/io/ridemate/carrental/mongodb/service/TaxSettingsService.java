package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.TaxSettingsDocument;
import io.ridemate.carrental.mongodb.repository.TaxSettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TaxSettingsService {

    private static final Logger log = LoggerFactory.getLogger(TaxSettingsService.class);
    private static final String DEFAULT_CONFIG_ID = "active_tax_config";

    private final TaxSettingsRepository taxSettingsRepository;
    private final AuditLogService auditLogService;

    public TaxSettingsService(TaxSettingsRepository taxSettingsRepository, AuditLogService auditLogService) {
        this.taxSettingsRepository = taxSettingsRepository;
        this.auditLogService = auditLogService;
    }

    public TaxSettingsDocument getActiveTaxSettings() {
        return taxSettingsRepository.findById(DEFAULT_CONFIG_ID).orElseGet(() -> {
            TaxSettingsDocument defaultDoc = new TaxSettingsDocument();
            defaultDoc.setId(DEFAULT_CONFIG_ID);
            defaultDoc.setGstRate(0.05); // 5% default
            defaultDoc.setCgstRate(0.025);
            defaultDoc.setSgstRate(0.025);
            defaultDoc.setIgstRate(0.05);
            defaultDoc.setUpdatedBy("system");
            defaultDoc.setUpdatedAt(LocalDateTime.now());
            defaultDoc.setEffectiveFrom(LocalDateTime.now());
            return taxSettingsRepository.save(defaultDoc);
        });
    }

    public TaxSettingsDocument updateTaxSettings(TaxSettingsDocument updateReq, String updatedBy, String reason) {
        TaxSettingsDocument current = getActiveTaxSettings();
        double oldRate = current.getGstRate();
        double newRate = updateReq.getGstRate() > 0 ? updateReq.getGstRate() : current.getGstRate();

        current.setGstRate(newRate);
        current.setCgstRate(newRate / 2.0);
        current.setSgstRate(newRate / 2.0);
        current.setIgstRate(newRate);

        if (updateReq.getTaxCalculationMode() != null) {
            current.setTaxCalculationMode(updateReq.getTaxCalculationMode());
        }
        current.setAdditionalTaxEnabled(updateReq.isAdditionalTaxEnabled());
        current.setAdditionalTaxRate(updateReq.getAdditionalTaxRate());
        if (updateReq.getAdditionalTaxName() != null) {
            current.setAdditionalTaxName(updateReq.getAdditionalTaxName());
        }
        if (updateReq.getTaxCategories() != null && !updateReq.getTaxCategories().isEmpty()) {
            current.setTaxCategories(updateReq.getTaxCategories());
        }

        String effectiveActor = updatedBy != null && !updatedBy.isBlank() ? updatedBy : "admin@ridemate.io";
        current.setUpdatedBy(effectiveActor);
        current.setUpdatedAt(LocalDateTime.now());
        current.setEffectiveFrom(LocalDateTime.now());

        // Append to change history
        String effectiveReason = reason != null && !reason.isBlank() ? reason : "Administrative tax rate update";
        current.getChangeHistory().add(new TaxSettingsDocument.TaxAuditHistoryItem(
                oldRate, newRate, effectiveActor, effectiveReason
        ));

        TaxSettingsDocument saved = taxSettingsRepository.save(current);

        // Record in central audit logs
        auditLogService.logAction(
                "GST_RATE_UPDATED",
                effectiveActor,
                String.format("Updated GST rate from %.1f%% to %.1f%%. Reason: %s", (oldRate * 100), (newRate * 100), effectiveReason),
                String.format("oldGst=%.4f,newGst=%.4f,effectiveFrom=%s", oldRate, newRate, saved.getEffectiveFrom())
        );

        log.info("Admin updated GST rate: {} -> {} by {}", oldRate, newRate, effectiveActor);
        return saved;
    }
}
