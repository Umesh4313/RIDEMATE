package io.ridemate.carrental.dto;

import jakarta.validation.constraints.*;

public class CreateBookingRequest {
    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @Email @NotBlank(message = "Customer email is required")
    private String customerEmail;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    @NotBlank(message = "Driver license number is required")
    private String driverLicenseNumber;

    private String pickupLocation;
    private String dropoffLocation;
    private String pickupDate;
    private String pickupTime;
    private String dropoffDate;
    private String dropoffTime;

    @Min(value = 1, message = "Rental must be at least 1 day")
    private int days;

    private String protectionPlan; // basic, standard, premium
    private String paymentMethodLast4;

    public CreateBookingRequest() {}

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getDriverLicenseNumber() { return driverLicenseNumber; }
    public void setDriverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDropoffLocation() { return dropoffLocation; }
    public void setDropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; }

    public String getPickupDate() { return pickupDate; }
    public void setPickupDate(String pickupDate) { this.pickupDate = pickupDate; }

    public String getPickupTime() { return pickupTime; }
    public void setPickupTime(String pickupTime) { this.pickupTime = pickupTime; }

    public String getDropoffDate() { return dropoffDate; }
    public void setDropoffDate(String dropoffDate) { this.dropoffDate = dropoffDate; }

    public String getDropoffTime() { return dropoffTime; }
    public void setDropoffTime(String dropoffTime) { this.dropoffTime = dropoffTime; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public String getProtectionPlan() { return protectionPlan; }
    public void setProtectionPlan(String protectionPlan) { this.protectionPlan = protectionPlan; }

    public String getPaymentMethodLast4() { return paymentMethodLast4; }
    public void setPaymentMethodLast4(String paymentMethodLast4) { this.paymentMethodLast4 = paymentMethodLast4; }

    private String couponCode;
    private double discountPercent;
    private double discountAmount;

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(double discountPercent) { this.discountPercent = discountPercent; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }
}
