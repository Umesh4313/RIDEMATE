package io.ridemate.carrental.mongodb.dto;

import java.util.ArrayList;
import java.util.List;

public class CustomerLoyaltyResponse {

    private String customerEmail;
    private String customerName;
    private int totalBookings;
    private double totalSpent;
    private String loyaltyTier; // "GUEST", "SILVER", "GOLD", "PLATINUM"
    private int loyaltyPoints;
    private double defaultDiscountPercent;
    private String recommendedCouponCode;
    private String tierBadgeTitle;
    private List<CouponSummaryDto> eligibleCoupons = new ArrayList<>();

    public CustomerLoyaltyResponse() {}

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }

    public double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }

    public String getLoyaltyTier() { return loyaltyTier; }
    public void setLoyaltyTier(String loyaltyTier) { this.loyaltyTier = loyaltyTier; }

    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public double getDefaultDiscountPercent() { return defaultDiscountPercent; }
    public void setDefaultDiscountPercent(double defaultDiscountPercent) { this.defaultDiscountPercent = defaultDiscountPercent; }

    public String getRecommendedCouponCode() { return recommendedCouponCode; }
    public void setRecommendedCouponCode(String recommendedCouponCode) { this.recommendedCouponCode = recommendedCouponCode; }

    public String getTierBadgeTitle() { return tierBadgeTitle; }
    public void setTierBadgeTitle(String tierBadgeTitle) { this.tierBadgeTitle = tierBadgeTitle; }

    public List<CouponSummaryDto> getEligibleCoupons() { return eligibleCoupons; }
    public void setEligibleCoupons(List<CouponSummaryDto> eligibleCoupons) { this.eligibleCoupons = eligibleCoupons; }
}
