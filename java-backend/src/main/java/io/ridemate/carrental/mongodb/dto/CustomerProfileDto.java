package io.ridemate.carrental.mongodb.dto;

import java.util.List;

public class CustomerProfileDto {

    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String driverLicenseNumber;
    private String membershipTier; // "ELITE", "VIP", "STANDARD"
    private int loyaltyPoints;

    private long totalBookings;
    private long completedRentals;
    private long upcomingRentals;
    private long canceledBookings;

    private double totalSpent;
    private double discountsReceived;
    private double refundsReceived;

    public CustomerProfileDto() {}

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getDriverLicenseNumber() { return driverLicenseNumber; }
    public void setDriverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; }
    public String getMembershipTier() { return membershipTier; }
    public void setMembershipTier(String membershipTier) { this.membershipTier = membershipTier; }
    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getCompletedRentals() { return completedRentals; }
    public void setCompletedRentals(long completedRentals) { this.completedRentals = completedRentals; }
    public long getUpcomingRentals() { return upcomingRentals; }
    public void setUpcomingRentals(long upcomingRentals) { this.upcomingRentals = upcomingRentals; }
    public long getCanceledBookings() { return canceledBookings; }
    public void setCanceledBookings(long canceledBookings) { this.canceledBookings = canceledBookings; }
    public double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }
    public double getDiscountsReceived() { return discountsReceived; }
    public void setDiscountsReceived(double discountsReceived) { this.discountsReceived = discountsReceived; }
    public double getRefundsReceived() { return refundsReceived; }
    public void setRefundsReceived(double refundsReceived) { this.refundsReceived = refundsReceived; }
}
