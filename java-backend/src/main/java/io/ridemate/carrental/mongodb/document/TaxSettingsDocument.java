package io.ridemate.carrental.mongodb.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tax_settings")
public class TaxSettingsDocument {

    @Id
    private String id = "active_tax_config";

    private double gstRate = 0.05; // 5% default (e.g. 0.05, 0.08, 0.12, 0.18)
    private double cgstRate = 0.025; // 2.5%
    private double sgstRate = 0.025; // 2.5%
    private double igstRate = 0.05;  // 5%
    private String taxCalculationMode = "ON_TAXABLE_AMOUNT"; // on eligible taxable subtotal
    private boolean additionalTaxEnabled = false;
    private double additionalTaxRate = 0.0;
    private String additionalTaxName = "Luxury Vehicle Surcharge";

    private String updatedBy = "system_admin";
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime effectiveFrom = LocalDateTime.now();

    private List<TaxCategoryItem> taxCategories = new ArrayList<>();
    private List<TaxAuditHistoryItem> changeHistory = new ArrayList<>();

    public TaxSettingsDocument() {
        if (taxCategories.isEmpty()) {
            taxCategories.add(new TaxCategoryItem("Base Car Rental GST", 5.0, true, "Standard rental service GST"));
            taxCategories.add(new TaxCategoryItem("Protection Plan GST", 5.0, true, "Coverage plan applicable GST"));
            taxCategories.add(new TaxCategoryItem("Luxury Vehicle Cess", 0.0, false, "Additional surcharge if applicable"));
        }
    }

    public static class TaxCategoryItem {
        private String name;
        private double rate;
        private boolean enabled;
        private String description;

        public TaxCategoryItem() {}
        public TaxCategoryItem(String name, double rate, boolean enabled, String description) {
            this.name = name;
            this.rate = rate;
            this.enabled = enabled;
            this.description = description;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getRate() { return rate; }
        public void setRate(double rate) { this.rate = rate; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class TaxAuditHistoryItem {
        private double oldRate;
        private double newRate;
        private String changedBy;
        private LocalDateTime timestamp;
        private String reason;

        public TaxAuditHistoryItem() {}
        public TaxAuditHistoryItem(double oldRate, double newRate, String changedBy, String reason) {
            this.oldRate = oldRate;
            this.newRate = newRate;
            this.changedBy = changedBy;
            this.timestamp = LocalDateTime.now();
            this.reason = reason;
        }

        public double getOldRate() { return oldRate; }
        public void setOldRate(double oldRate) { this.oldRate = oldRate; }
        public double getNewRate() { return newRate; }
        public void setNewRate(double newRate) { this.newRate = newRate; }
        public String getChangedBy() { return changedBy; }
        public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public double getGstRate() { return gstRate; }
    public void setGstRate(double gstRate) { this.gstRate = gstRate; }
    public double getCgstRate() { return cgstRate; }
    public void setCgstRate(double cgstRate) { this.cgstRate = cgstRate; }
    public double getSgstRate() { return sgstRate; }
    public void setSgstRate(double sgstRate) { this.sgstRate = sgstRate; }
    public double getIgstRate() { return igstRate; }
    public void setIgstRate(double igstRate) { this.igstRate = igstRate; }
    public String getTaxCalculationMode() { return taxCalculationMode; }
    public void setTaxCalculationMode(String taxCalculationMode) { this.taxCalculationMode = taxCalculationMode; }
    public boolean isAdditionalTaxEnabled() { return additionalTaxEnabled; }
    public void setAdditionalTaxEnabled(boolean additionalTaxEnabled) { this.additionalTaxEnabled = additionalTaxEnabled; }
    public double getAdditionalTaxRate() { return additionalTaxRate; }
    public void setAdditionalTaxRate(double additionalTaxRate) { this.additionalTaxRate = additionalTaxRate; }
    public String getAdditionalTaxName() { return additionalTaxName; }
    public void setAdditionalTaxName(String additionalTaxName) { this.additionalTaxName = additionalTaxName; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public List<TaxCategoryItem> getTaxCategories() { return taxCategories; }
    public void setTaxCategories(List<TaxCategoryItem> taxCategories) { this.taxCategories = taxCategories; }
    public List<TaxAuditHistoryItem> getChangeHistory() { return changeHistory; }
    public void setChangeHistory(List<TaxAuditHistoryItem> changeHistory) { this.changeHistory = changeHistory; }
}
