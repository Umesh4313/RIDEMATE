package io.ridemate.carrental.mongodb.dto;

public class CouponSummaryDto {

    private String code;
    private String title;
    private String description;
    private double discountPercent;
    private String applicableUserType;
    private int minRentalDays;
    private boolean recommended;

    public CouponSummaryDto() {}

    public CouponSummaryDto(String code, String title, String description, double discountPercent,
                            String applicableUserType, int minRentalDays, boolean recommended) {
        this.code = code;
        this.title = title;
        this.description = description;
        this.discountPercent = discountPercent;
        this.applicableUserType = applicableUserType;
        this.minRentalDays = minRentalDays;
        this.recommended = recommended;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(double discountPercent) { this.discountPercent = discountPercent; }

    public String getApplicableUserType() { return applicableUserType; }
    public void setApplicableUserType(String applicableUserType) { this.applicableUserType = applicableUserType; }

    public int getMinRentalDays() { return minRentalDays; }
    public void setMinRentalDays(int minRentalDays) { this.minRentalDays = minRentalDays; }

    public boolean isRecommended() { return recommended; }
    public void setRecommended(boolean recommended) { this.recommended = recommended; }
}
