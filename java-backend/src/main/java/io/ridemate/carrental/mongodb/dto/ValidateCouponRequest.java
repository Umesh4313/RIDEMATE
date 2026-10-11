package io.ridemate.carrental.mongodb.dto;

import jakarta.validation.constraints.NotBlank;

public class ValidateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    private String customerEmail;
    private String customerName;
    private int days;
    private double rentalSubtotal;
    private double protectionFee;
    private double totalDue;

    public ValidateCouponRequest() {}

    public ValidateCouponRequest(String code, String customerEmail, int days, double rentalSubtotal, double totalDue) {
        this.code = code;
        this.customerEmail = customerEmail;
        this.days = days;
        this.rentalSubtotal = rentalSubtotal;
        this.totalDue = totalDue;
    }

    public ValidateCouponRequest(String code, String customerEmail, int days, double rentalSubtotal, double protectionFee, double totalDue) {
        this.code = code;
        this.customerEmail = customerEmail;
        this.days = days;
        this.rentalSubtotal = rentalSubtotal;
        this.protectionFee = protectionFee;
        this.totalDue = totalDue;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public double getRentalSubtotal() { return rentalSubtotal; }
    public void setRentalSubtotal(double rentalSubtotal) { this.rentalSubtotal = rentalSubtotal; }

    public double getProtectionFee() { return protectionFee; }
    public void setProtectionFee(double protectionFee) { this.protectionFee = protectionFee; }

    public double getTotalDue() { return totalDue; }
    public void setTotalDue(double totalDue) { this.totalDue = totalDue; }
}

