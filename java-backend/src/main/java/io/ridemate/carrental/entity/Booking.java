package io.ridemate.carrental.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String pickupCode;

    @Column(nullable = false)
    private String vehicleId;

    private String vehicleName;
    private String vehicleBrand;
    private String vehicleModel;
    private int vehicleYear;
    private String vehicleCategory;
    private String vehicleImageUrl;
    private double vehicleRentalPricePerDay;

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private String dropoffLocation;

    private String pickupDate;
    private String pickupTime;
    private String dropoffDate;
    private String dropoffTime;
    private int days;
    private double dailyRate;
    private double rentalRateTotal;
    private double taxesAndFees;

    private String protectionPlan; // basic, standard, premium
    private double protectionFee;
    private double totalDue;

    @Column(nullable = false)
    private String status; // Confirmed, Active, Completed, Cancelled

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    private String customerPhone;
    private String driverLicenseNumber;
    private String paymentMethodLast4;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String couponCode;
    private double discountPercent;
    private double discountAmount;
    private double originalTotalDue;
    private double taxableAmount;
    private double gstRate;
    private double gstAmount;

    public Booking() {
    }

    public Booking(String id, String pickupCode, String vehicleId, String vehicleName, String vehicleBrand,
                   String vehicleModel, int vehicleYear, String vehicleCategory, String vehicleImageUrl,
                   double vehicleRentalPricePerDay, String pickupLocation, String dropoffLocation,
                   String pickupDate, String pickupTime, String dropoffDate, String dropoffTime,
                   int days, double dailyRate, double rentalRateTotal, double taxesAndFees,
                   String protectionPlan, double protectionFee, double totalDue, String status,
                   String customerName, String customerEmail, String customerPhone,
                   String driverLicenseNumber, String paymentMethodLast4, LocalDateTime createdAt,
                   LocalDateTime updatedAt) {
        this.id = id;
        this.pickupCode = pickupCode;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.vehicleBrand = vehicleBrand;
        this.vehicleModel = vehicleModel;
        this.vehicleYear = vehicleYear;
        this.vehicleCategory = vehicleCategory;
        this.vehicleImageUrl = vehicleImageUrl;
        this.vehicleRentalPricePerDay = vehicleRentalPricePerDay;
        this.pickupLocation = pickupLocation;
        this.dropoffLocation = dropoffLocation;
        this.pickupDate = pickupDate;
        this.pickupTime = pickupTime;
        this.dropoffDate = dropoffDate;
        this.dropoffTime = dropoffTime;
        this.days = days;
        this.dailyRate = dailyRate;
        this.rentalRateTotal = rentalRateTotal;
        this.taxesAndFees = taxesAndFees;
        this.protectionPlan = protectionPlan;
        this.protectionFee = protectionFee;
        this.totalDue = totalDue;
        this.status = status;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.driverLicenseNumber = driverLicenseNumber;
        this.paymentMethodLast4 = paymentMethodLast4;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "Confirmed";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPickupCode() { return pickupCode; }
    public void setPickupCode(String pickupCode) { this.pickupCode = pickupCode; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getVehicleBrand() { return vehicleBrand; }
    public void setVehicleBrand(String vehicleBrand) { this.vehicleBrand = vehicleBrand; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public int getVehicleYear() { return vehicleYear; }
    public void setVehicleYear(int vehicleYear) { this.vehicleYear = vehicleYear; }

    public String getVehicleCategory() { return vehicleCategory; }
    public void setVehicleCategory(String vehicleCategory) { this.vehicleCategory = vehicleCategory; }

    public String getVehicleImageUrl() { return vehicleImageUrl; }
    public void setVehicleImageUrl(String vehicleImageUrl) { this.vehicleImageUrl = vehicleImageUrl; }

    public double getVehicleRentalPricePerDay() { return vehicleRentalPricePerDay; }
    public void setVehicleRentalPricePerDay(double vehicleRentalPricePerDay) { this.vehicleRentalPricePerDay = vehicleRentalPricePerDay; }

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

    public double getDailyRate() { return dailyRate; }
    public void setDailyRate(double dailyRate) { this.dailyRate = dailyRate; }

    public double getRentalRateTotal() { return rentalRateTotal; }
    public void setRentalRateTotal(double rentalRateTotal) { this.rentalRateTotal = rentalRateTotal; }

    public double getTaxesAndFees() { return taxesAndFees; }
    public void setTaxesAndFees(double taxesAndFees) { this.taxesAndFees = taxesAndFees; }

    public String getProtectionPlan() { return protectionPlan; }
    public void setProtectionPlan(String protectionPlan) { this.protectionPlan = protectionPlan; }

    public double getProtectionFee() { return protectionFee; }
    public void setProtectionFee(double protectionFee) { this.protectionFee = protectionFee; }

    public double getTotalDue() { return totalDue; }
    public void setTotalDue(double totalDue) { this.totalDue = totalDue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getDriverLicenseNumber() { return driverLicenseNumber; }
    public void setDriverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; }

    public String getPaymentMethodLast4() { return paymentMethodLast4; }
    public void setPaymentMethodLast4(String paymentMethodLast4) { this.paymentMethodLast4 = paymentMethodLast4; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(double discountPercent) { this.discountPercent = discountPercent; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }

    public double getOriginalTotalDue() { return originalTotalDue; }
    public void setOriginalTotalDue(double originalTotalDue) { this.originalTotalDue = originalTotalDue; }

    public double getTaxableAmount() { return taxableAmount; }
    public void setTaxableAmount(double taxableAmount) { this.taxableAmount = taxableAmount; }

    public double getGstRate() { return gstRate; }
    public void setGstRate(double gstRate) { this.gstRate = gstRate; }

    public double getGstAmount() { return gstAmount; }
    public void setGstAmount(double gstAmount) { this.gstAmount = gstAmount; }

    // Builder
    public static BookingBuilder builder() {
        return new BookingBuilder();
    }

    public static class BookingBuilder {
        private String id;
        private String pickupCode;
        private String vehicleId;
        private String vehicleName;
        private String vehicleBrand;
        private String vehicleModel;
        private int vehicleYear;
        private String vehicleCategory;
        private String vehicleImageUrl;
        private double vehicleRentalPricePerDay;
        private String pickupLocation;
        private String dropoffLocation;
        private String pickupDate;
        private String pickupTime;
        private String dropoffDate;
        private String dropoffTime;
        private int days;
        private double dailyRate;
        private double rentalRateTotal;
        private double taxesAndFees;
        private String protectionPlan;
        private double protectionFee;
        private double totalDue;
        private String status;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private String driverLicenseNumber;
        private String paymentMethodLast4;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String couponCode;
        private double discountPercent;
        private double discountAmount;
        private double originalTotalDue;

        private double taxableAmount;
        private double gstRate;
        private double gstAmount;

        public BookingBuilder id(String id) { this.id = id; return this; }
        public BookingBuilder pickupCode(String pickupCode) { this.pickupCode = pickupCode; return this; }
        public BookingBuilder vehicleId(String vehicleId) { this.vehicleId = vehicleId; return this; }
        public BookingBuilder vehicleName(String vehicleName) { this.vehicleName = vehicleName; return this; }
        public BookingBuilder vehicleBrand(String vehicleBrand) { this.vehicleBrand = vehicleBrand; return this; }
        public BookingBuilder vehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; return this; }
        public BookingBuilder vehicleYear(int vehicleYear) { this.vehicleYear = vehicleYear; return this; }
        public BookingBuilder vehicleCategory(String vehicleCategory) { this.vehicleCategory = vehicleCategory; return this; }
        public BookingBuilder vehicleImageUrl(String vehicleImageUrl) { this.vehicleImageUrl = vehicleImageUrl; return this; }
        public BookingBuilder vehicleRentalPricePerDay(double vehicleRentalPricePerDay) { this.vehicleRentalPricePerDay = vehicleRentalPricePerDay; return this; }
        public BookingBuilder pickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; return this; }
        public BookingBuilder dropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; return this; }
        public BookingBuilder pickupDate(String pickupDate) { this.pickupDate = pickupDate; return this; }
        public BookingBuilder pickupTime(String pickupTime) { this.pickupTime = pickupTime; return this; }
        public BookingBuilder dropoffDate(String dropoffDate) { this.dropoffDate = dropoffDate; return this; }
        public BookingBuilder dropoffTime(String dropoffTime) { this.dropoffTime = dropoffTime; return this; }
        public BookingBuilder days(int days) { this.days = days; return this; }
        public BookingBuilder dailyRate(double dailyRate) { this.dailyRate = dailyRate; return this; }
        public BookingBuilder rentalRateTotal(double rentalRateTotal) { this.rentalRateTotal = rentalRateTotal; return this; }
        public BookingBuilder taxesAndFees(double taxesAndFees) { this.taxesAndFees = taxesAndFees; return this; }
        public BookingBuilder protectionPlan(String protectionPlan) { this.protectionPlan = protectionPlan; return this; }
        public BookingBuilder protectionFee(double protectionFee) { this.protectionFee = protectionFee; return this; }
        public BookingBuilder totalDue(double totalDue) { this.totalDue = totalDue; return this; }
        public BookingBuilder status(String status) { this.status = status; return this; }
        public BookingBuilder customerName(String customerName) { this.customerName = customerName; return this; }
        public BookingBuilder customerEmail(String customerEmail) { this.customerEmail = customerEmail; return this; }
        public BookingBuilder customerPhone(String customerPhone) { this.customerPhone = customerPhone; return this; }
        public BookingBuilder driverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; return this; }
        public BookingBuilder paymentMethodLast4(String paymentMethodLast4) { this.paymentMethodLast4 = paymentMethodLast4; return this; }
        public BookingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BookingBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public BookingBuilder couponCode(String couponCode) { this.couponCode = couponCode; return this; }
        public BookingBuilder discountPercent(double discountPercent) { this.discountPercent = discountPercent; return this; }
        public BookingBuilder discountAmount(double discountAmount) { this.discountAmount = discountAmount; return this; }
        public BookingBuilder originalTotalDue(double originalTotalDue) { this.originalTotalDue = originalTotalDue; return this; }
        public BookingBuilder taxableAmount(double taxableAmount) { this.taxableAmount = taxableAmount; return this; }
        public BookingBuilder gstRate(double gstRate) { this.gstRate = gstRate; return this; }
        public BookingBuilder gstAmount(double gstAmount) { this.gstAmount = gstAmount; return this; }

        public Booking build() {
            Booking b = new Booking(id, pickupCode, vehicleId, vehicleName, vehicleBrand, vehicleModel, vehicleYear,
                    vehicleCategory, vehicleImageUrl, vehicleRentalPricePerDay, pickupLocation, dropoffLocation,
                    pickupDate, pickupTime, dropoffDate, dropoffTime, days, dailyRate, rentalRateTotal,
                    taxesAndFees, protectionPlan, protectionFee, totalDue, status, customerName,
                    customerEmail, customerPhone, driverLicenseNumber, paymentMethodLast4, createdAt, updatedAt);
            b.setCouponCode(couponCode);
            b.setDiscountPercent(discountPercent);
            b.setDiscountAmount(discountAmount);
            b.setOriginalTotalDue(originalTotalDue);
            b.setTaxableAmount(taxableAmount);
            b.setGstRate(gstRate);
            b.setGstAmount(gstAmount);
            return b;
        }
    }
}
