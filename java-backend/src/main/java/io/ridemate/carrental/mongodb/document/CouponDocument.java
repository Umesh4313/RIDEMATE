package io.ridemate.carrental.mongodb.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "coupons")
public class CouponDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code; // e.g., FIRST10, REGULAR15, VIP20, WEEKEND25, SUMMER10

    private String title;
    private String description;
    private double discountPercent; // e.g. 10.0, 15.0, 20.0
    private double discountAmount;  // Optional flat discount amount
    private String discountType;    // "PERCENTAGE" or "FLAT"
    private String applicableUserType; // "FIRST_TIME", "REGULAR", "VIP", "ALL"
    private int minRentalDays;      // Minimum days required (default 1)
    private double minBookingAmount;
    private double maxDiscountAmount; // Cap on discount, e.g. 150.0
    private boolean active;
    private long usageCount;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public CouponDocument() {
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.minRentalDays = 1;
        this.maxDiscountAmount = 250.0;
        this.discountType = "PERCENTAGE";
    }

    public CouponDocument(String code, String title, String description, double discountPercent,
                          String applicableUserType, int minRentalDays, double maxDiscountAmount) {
        this.code = code;
        this.title = title;
        this.description = description;
        this.discountPercent = discountPercent;
        this.applicableUserType = applicableUserType;
        this.minRentalDays = minRentalDays;
        this.maxDiscountAmount = maxDiscountAmount;
        this.discountType = "PERCENTAGE";
        this.active = true;
        this.usageCount = 0;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusMonths(12);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(double discountPercent) { this.discountPercent = discountPercent; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public String getApplicableUserType() { return applicableUserType; }
    public void setApplicableUserType(String applicableUserType) { this.applicableUserType = applicableUserType; }

    public int getMinRentalDays() { return minRentalDays; }
    public void setMinRentalDays(int minRentalDays) { this.minRentalDays = minRentalDays; }

    public double getMinBookingAmount() { return minBookingAmount; }
    public void setMinBookingAmount(double minBookingAmount) { this.minBookingAmount = minBookingAmount; }

    public double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public long getUsageCount() { return usageCount; }
    public void setUsageCount(long usageCount) { this.usageCount = usageCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
