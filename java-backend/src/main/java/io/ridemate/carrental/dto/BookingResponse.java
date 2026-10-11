package io.ridemate.carrental.dto;

import io.ridemate.carrental.entity.Booking;
import io.ridemate.carrental.mongodb.document.MongoBookingDocument;

public class BookingResponse {
    private String id;
    private String pickupCode;
    private String vehicleId;
    private String vehicleName;
    private String vehicleBrand;
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
    private String createdAt;
    private String voucherDownloadUrl;
    private String couponCode;
    private double discountPercent;
    private double discountAmount;
    private double originalTotalDue;
    private double taxableAmount;
    private double gstRate;
    private double gstAmount;

    public BookingResponse() {}

    public BookingResponse(String id, String pickupCode, String vehicleId, String vehicleName, String vehicleBrand,
                           String vehicleImageUrl, double vehicleRentalPricePerDay, String pickupLocation,
                           String dropoffLocation, String pickupDate, String pickupTime, String dropoffDate,
                           String dropoffTime, int days, double dailyRate, double rentalRateTotal,
                           double taxesAndFees, String protectionPlan, double protectionFee, double totalDue,
                           String status, String customerName, String customerEmail, String customerPhone,
                           String driverLicenseNumber, String paymentMethodLast4, String createdAt,
                           String voucherDownloadUrl) {
        this.id = id;
        this.pickupCode = pickupCode;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.vehicleBrand = vehicleBrand;
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
        this.voucherDownloadUrl = voucherDownloadUrl;
    }

    public static BookingResponse fromEntity(Booking b) {
        BookingResponse r = BookingResponse.builder()
                .id(b.getId())
                .pickupCode(b.getPickupCode())
                .vehicleId(b.getVehicleId())
                .vehicleName(b.getVehicleName())
                .vehicleBrand(b.getVehicleBrand())
                .vehicleImageUrl(b.getVehicleImageUrl())
                .vehicleRentalPricePerDay(b.getVehicleRentalPricePerDay())
                .pickupLocation(b.getPickupLocation())
                .dropoffLocation(b.getDropoffLocation())
                .pickupDate(b.getPickupDate())
                .pickupTime(b.getPickupTime())
                .dropoffDate(b.getDropoffDate())
                .dropoffTime(b.getDropoffTime())
                .days(b.getDays())
                .dailyRate(b.getDailyRate())
                .rentalRateTotal(b.getRentalRateTotal())
                .taxesAndFees(b.getTaxesAndFees())
                .protectionPlan(b.getProtectionPlan())
                .protectionFee(b.getProtectionFee())
                .totalDue(b.getTotalDue())
                .status(b.getStatus())
                .customerName(b.getCustomerName())
                .customerEmail(b.getCustomerEmail())
                .customerPhone(b.getCustomerPhone())
                .driverLicenseNumber(b.getDriverLicenseNumber())
                .paymentMethodLast4(b.getPaymentMethodLast4())
                .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null)
                .voucherDownloadUrl("/api/v1/bookings/" + b.getId() + "/voucher")
                .couponCode(b.getCouponCode())
                .discountPercent(b.getDiscountPercent())
                .discountAmount(b.getDiscountAmount())
                .originalTotalDue(b.getOriginalTotalDue())
                .taxableAmount(b.getTaxableAmount())
                .gstRate(b.getGstRate())
                .gstAmount(b.getGstAmount())
                .build();
        return r;
    }

    public static BookingResponse fromMongoDocument(MongoBookingDocument m) {
        BookingResponse r = BookingResponse.builder()
                .id(m.getId())
                .pickupCode(m.getPickupCode())
                .vehicleId(m.getVehicleId())
                .vehicleName(m.getVehicleName())
                .vehicleBrand(m.getVehicleBrand())
                .pickupDate(m.getPickupDate())
                .pickupTime("10:00 AM")
                .dropoffDate(m.getDropoffDate())
                .dropoffTime("02:00 PM")
                .days(m.getDays())
                .dailyRate(m.getDailyRate())
                .rentalRateTotal(m.getBaseRentalPrice())
                .taxesAndFees(m.getGstAmount())
                .protectionPlan(m.getProtectionPlan())
                .protectionFee(m.getProtectionFee())
                .totalDue(m.getTotalDue())
                .status(m.getStatus())
                .customerName(m.getCustomerName())
                .customerEmail(m.getCustomerEmail())
                .customerPhone(m.getCustomerPhone())
                .paymentMethodLast4(m.getPaymentMethodLast4())
                .createdAt(m.getCreatedAt() != null ? m.getCreatedAt().toString() : null)
                .voucherDownloadUrl("/api/v1/bookings/" + m.getId() + "/voucher")
                .couponCode(m.getCouponCode())
                .discountPercent(m.getDiscountPercent())
                .discountAmount(m.getDiscountAmount())
                .taxableAmount(m.getTaxableAmount())
                .gstRate(m.getGstRate())
                .gstAmount(m.getGstAmount())
                .build();
        return r;
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

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getVoucherDownloadUrl() { return voucherDownloadUrl; }
    public void setVoucherDownloadUrl(String voucherDownloadUrl) { this.voucherDownloadUrl = voucherDownloadUrl; }

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
    public static BookingResponseBuilder builder() {
        return new BookingResponseBuilder();
    }

    public static class BookingResponseBuilder {
        private String id;
        private String pickupCode;
        private String vehicleId;
        private String vehicleName;
        private String vehicleBrand;
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
        private String createdAt;
        private String voucherDownloadUrl;

        public BookingResponseBuilder id(String id) { this.id = id; return this; }
        public BookingResponseBuilder pickupCode(String pickupCode) { this.pickupCode = pickupCode; return this; }
        public BookingResponseBuilder vehicleId(String vehicleId) { this.vehicleId = vehicleId; return this; }
        public BookingResponseBuilder vehicleName(String vehicleName) { this.vehicleName = vehicleName; return this; }
        public BookingResponseBuilder vehicleBrand(String vehicleBrand) { this.vehicleBrand = vehicleBrand; return this; }
        public BookingResponseBuilder vehicleImageUrl(String vehicleImageUrl) { this.vehicleImageUrl = vehicleImageUrl; return this; }
        public BookingResponseBuilder vehicleRentalPricePerDay(double vehicleRentalPricePerDay) { this.vehicleRentalPricePerDay = vehicleRentalPricePerDay; return this; }
        public BookingResponseBuilder pickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; return this; }
        public BookingResponseBuilder dropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; return this; }
        public BookingResponseBuilder pickupDate(String pickupDate) { this.pickupDate = pickupDate; return this; }
        public BookingResponseBuilder pickupTime(String pickupTime) { this.pickupTime = pickupTime; return this; }
        public BookingResponseBuilder dropoffDate(String dropoffDate) { this.dropoffDate = dropoffDate; return this; }
        public BookingResponseBuilder dropoffTime(String dropoffTime) { this.dropoffTime = dropoffTime; return this; }
        public BookingResponseBuilder days(int days) { this.days = days; return this; }
        public BookingResponseBuilder dailyRate(double dailyRate) { this.dailyRate = dailyRate; return this; }
        public BookingResponseBuilder rentalRateTotal(double rentalRateTotal) { this.rentalRateTotal = rentalRateTotal; return this; }
        public BookingResponseBuilder taxesAndFees(double taxesAndFees) { this.taxesAndFees = taxesAndFees; return this; }
        public BookingResponseBuilder protectionPlan(String protectionPlan) { this.protectionPlan = protectionPlan; return this; }
        public BookingResponseBuilder protectionFee(double protectionFee) { this.protectionFee = protectionFee; return this; }
        public BookingResponseBuilder totalDue(double totalDue) { this.totalDue = totalDue; return this; }
        public BookingResponseBuilder status(String status) { this.status = status; return this; }
        public BookingResponseBuilder customerName(String customerName) { this.customerName = customerName; return this; }
        public BookingResponseBuilder customerEmail(String customerEmail) { this.customerEmail = customerEmail; return this; }
        public BookingResponseBuilder customerPhone(String customerPhone) { this.customerPhone = customerPhone; return this; }
        public BookingResponseBuilder driverLicenseNumber(String driverLicenseNumber) { this.driverLicenseNumber = driverLicenseNumber; return this; }
        public BookingResponseBuilder paymentMethodLast4(String paymentMethodLast4) { this.paymentMethodLast4 = paymentMethodLast4; return this; }
        public BookingResponseBuilder createdAt(String createdAt) { this.createdAt = createdAt; return this; }
        public BookingResponseBuilder voucherDownloadUrl(String voucherDownloadUrl) { this.voucherDownloadUrl = voucherDownloadUrl; return this; }

        private String couponCode;
        private double discountPercent;
        private double discountAmount;
        private double originalTotalDue;
        private double taxableAmount;
        private double gstRate;
        private double gstAmount;

        public BookingResponseBuilder couponCode(String couponCode) { this.couponCode = couponCode; return this; }
        public BookingResponseBuilder discountPercent(double discountPercent) { this.discountPercent = discountPercent; return this; }
        public BookingResponseBuilder discountAmount(double discountAmount) { this.discountAmount = discountAmount; return this; }
        public BookingResponseBuilder originalTotalDue(double originalTotalDue) { this.originalTotalDue = originalTotalDue; return this; }
        public BookingResponseBuilder taxableAmount(double taxableAmount) { this.taxableAmount = taxableAmount; return this; }
        public BookingResponseBuilder gstRate(double gstRate) { this.gstRate = gstRate; return this; }
        public BookingResponseBuilder gstAmount(double gstAmount) { this.gstAmount = gstAmount; return this; }

        public BookingResponse build() {
            BookingResponse resp = new BookingResponse(id, pickupCode, vehicleId, vehicleName, vehicleBrand, vehicleImageUrl,
                    vehicleRentalPricePerDay, pickupLocation, dropoffLocation, pickupDate, pickupTime,
                    dropoffDate, dropoffTime, days, dailyRate, rentalRateTotal, taxesAndFees, protectionPlan,
                    protectionFee, totalDue, status, customerName, customerEmail, customerPhone,
                    driverLicenseNumber, paymentMethodLast4, createdAt, voucherDownloadUrl);
            resp.setCouponCode(couponCode);
            resp.setDiscountPercent(discountPercent);
            resp.setDiscountAmount(discountAmount);
            resp.setOriginalTotalDue(originalTotalDue);
            resp.setTaxableAmount(taxableAmount);
            resp.setGstRate(gstRate);
            resp.setGstAmount(gstAmount);
            return resp;
        }
    }
}
