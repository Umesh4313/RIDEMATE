package io.ridemate.carrental.mongodb.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "policy_settings")
public class PolicySettingsDocument {

    @Id
    private String id = "active_policy_config";

    private double lateReturnFeePerHour = 500.0;
    private double securityDepositAmount = 0.0;
    private boolean securityDepositEnabled = true;
    private String securityDepositType = "CREDIT_CARD_PREAUTH_HOLD";

    private List<CancellationTierItem> cancellationTiers = new ArrayList<>();
    private List<AdditionalChargeItem> additionalCharges = new ArrayList<>();

    private String updatedBy = "system_admin";
    private LocalDateTime updatedAt = LocalDateTime.now();

    public PolicySettingsDocument() {
        if (cancellationTiers.isEmpty()) {
            cancellationTiers.add(new CancellationTierItem("Full Refund Window", 72, 0.0, "More than 72 hours before pickup: 100% refund, ₹0 cancellation fee"));
            cancellationTiers.add(new CancellationTierItem("Standard Notice Window", 24, 10.0, "24 to 72 hours before pickup: 10% cancellation fee"));
            cancellationTiers.add(new CancellationTierItem("Late Notice Window", 0, 25.0, "Less than 24 hours before pickup: 25% cancellation fee"));
        }
        if (additionalCharges.isEmpty()) {
            additionalCharges.add(new AdditionalChargeItem("Standard GPS Navigation", 250.0, true, "Turn-by-turn premium offline navigation unit"));
            additionalCharges.add(new AdditionalChargeItem("Child Safety Seat (ISOFIX)", 350.0, true, "Certified child safety seat for infants/toddlers"));
            additionalCharges.add(new AdditionalChargeItem("Additional Authorized Driver", 500.0, true, "Co-driver insurance coverage registration"));
        }
    }

    public static class CancellationTierItem {
        private String name;
        private int minHoursBeforePickup;
        private double feePercentage;
        private String description;

        public CancellationTierItem() {}
        public CancellationTierItem(String name, int minHoursBeforePickup, double feePercentage, String description) {
            this.name = name;
            this.minHoursBeforePickup = minHoursBeforePickup;
            this.feePercentage = feePercentage;
            this.description = description;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getMinHoursBeforePickup() { return minHoursBeforePickup; }
        public void setMinHoursBeforePickup(int minHoursBeforePickup) { this.minHoursBeforePickup = minHoursBeforePickup; }
        public double getFeePercentage() { return feePercentage; }
        public void setFeePercentage(double feePercentage) { this.feePercentage = feePercentage; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class AdditionalChargeItem {
        private String name;
        private double amount;
        private boolean taxable;
        private String description;

        public AdditionalChargeItem() {}
        public AdditionalChargeItem(String name, double amount, boolean taxable, String description) {
            this.name = name;
            this.amount = amount;
            this.taxable = taxable;
            this.description = description;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public boolean isTaxable() { return taxable; }
        public void setTaxable(boolean taxable) { this.taxable = taxable; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public double getLateReturnFeePerHour() { return lateReturnFeePerHour; }
    public void setLateReturnFeePerHour(double lateReturnFeePerHour) { this.lateReturnFeePerHour = lateReturnFeePerHour; }
    public double getSecurityDepositAmount() { return securityDepositAmount; }
    public void setSecurityDepositAmount(double securityDepositAmount) { this.securityDepositAmount = securityDepositAmount; }
    public boolean isSecurityDepositEnabled() { return securityDepositEnabled; }
    public void setSecurityDepositEnabled(boolean securityDepositEnabled) { this.securityDepositEnabled = securityDepositEnabled; }
    public String getSecurityDepositType() { return securityDepositType; }
    public void setSecurityDepositType(String securityDepositType) { this.securityDepositType = securityDepositType; }
    public List<CancellationTierItem> getCancellationTiers() { return cancellationTiers; }
    public void setCancellationTiers(List<CancellationTierItem> cancellationTiers) { this.cancellationTiers = cancellationTiers; }
    public List<AdditionalChargeItem> getAdditionalCharges() { return additionalCharges; }
    public void setAdditionalCharges(List<AdditionalChargeItem> additionalCharges) { this.additionalCharges = additionalCharges; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
