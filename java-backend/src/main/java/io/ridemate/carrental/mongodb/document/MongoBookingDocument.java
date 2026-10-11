package io.ridemate.carrental.mongodb.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "customer_bookings")
public class MongoBookingDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String pickupCode;

    @Indexed
    private String customerEmail;

    private String customerName;
    private String customerPhone;
    private String vehicleId;
    private String vehicleName;
    private String vehicleBrand;
    private String pickupDate;
    private String dropoffDate;
    private int days;
    private double dailyRate;
    private double baseRentalPrice;
    private String protectionPlan;
    private double protectionFee;

    // Coupon & Discount details
    private String couponCode;
    private double discountPercent;
    private double discountAmount;

    // Tax & GST breakdown (Indian GST @ 5%)
    private double taxableAmount;
    private double gstRate; // e.g. 0.05 (5%)
    private double gstAmount;
    private double totalDue;

    @Indexed
    private String status; // "Confirmed", "Active", "Completed", "Cancelled"
    private String paymentStatus; // "PAID", "REFUNDED", "FAILED"
    private String paymentMethodLast4;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MongoBookingDocument() {
        this.status = "Confirmed";
        this.paymentStatus = "PAID";
        this.gstRate = 0.05;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public MongoBookingDocument(String id, String pickupCode, String customerEmail, String customerName,
                                String vehicleId, String vehicleName, int days, double dailyRate,
                                double baseRentalPrice, String protectionPlan, double protectionFee,
                                String couponCode, double discountPercent, double discountAmount,
                                double taxableAmount, double gstRate, double gstAmount, double totalDue,
                                String status, String paymentStatus, String paymentMethodLast4) {
        this.id = id;
        this.pickupCode = pickupCode;
        this.customerEmail = customerEmail != null ? customerEmail.trim().toLowerCase() : "";
        this.customerName = customerName;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.days = days;
        this.dailyRate = dailyRate;
        this.baseRentalPrice = baseRentalPrice;
        this.protectionPlan = protectionPlan;
        this.protectionFee = protectionFee;
        this.couponCode = couponCode;
        this.discountPercent = discountPercent;
        this.discountAmount = discountAmount;
        this.taxableAmount = taxableAmount;
        this.gstRate = gstRate > 0 ? gstRate : 0.05;
        this.gstAmount = gstAmount;
        this.totalDue = totalDue;
        this.status = status != null ? status : "Confirmed";
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PAID";
        this.paymentMethodLast4 = paymentMethodLast4;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPickupCode() { return pickupCode; }
    public void setPickupCode(String pickupCode) { this.pickupCode = pickupCode; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail != null ? customerEmail.trim().toLowerCase() : ""; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getVehicleBrand() { return vehicleBrand; }
    public void setVehicleBrand(String vehicleBrand) { this.vehicleBrand = vehicleBrand; }

    public String getPickupDate() { return pickupDate; }
    public void setPickupDate(String pickupDate) { this.pickupDate = pickupDate; }

    public String getDropoffDate() { return dropoffDate; }
    public void setDropoffDate(String dropoffDate) { this.dropoffDate = dropoffDate; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public double getDailyRate() { return dailyRate; }
    public void setDailyRate(double dailyRate) { this.dailyRate = dailyRate; }

    public double getBaseRentalPrice() { return baseRentalPrice; }
    public void setBaseRentalPrice(double baseRentalPrice) { this.baseRentalPrice = baseRentalPrice; }

    public String getProtectionPlan() { return protectionPlan; }
    public void setProtectionPlan(String protectionPlan) { this.protectionPlan = protectionPlan; }

    public double getProtectionFee() { return protectionFee; }
    public void setProtectionFee(double protectionFee) { this.protectionFee = protectionFee; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(double discountPercent) { this.discountPercent = discountPercent; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }

    public double getTaxableAmount() { return taxableAmount; }
    public void setTaxableAmount(double taxableAmount) { this.taxableAmount = taxableAmount; }

    public double getGstRate() { return gstRate; }
    public void setGstRate(double gstRate) { this.gstRate = gstRate; }

    public double getGstAmount() { return gstAmount; }
    public void setGstAmount(double gstAmount) { this.gstAmount = gstAmount; }

    public double getTotalDue() { return totalDue; }
    public void setTotalDue(double totalDue) { this.totalDue = totalDue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethodLast4() { return paymentMethodLast4; }
    public void setPaymentMethodLast4(String paymentMethodLast4) { this.paymentMethodLast4 = paymentMethodLast4; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
