package io.ridemate.carrental.mongodb.dto;

public class CouponValidationResponse {

    private boolean valid;
    private String code;
    private String title;
    private String description;
    private double discountPercent;
    private double discountAmount;
    private double originalTotal;
    private double discountedTotal;
    private String message;
    private String applicableUserType;

    // Detailed Price Breakdown (Base rental -> Discount -> Taxable -> GST -> Total)
    private double baseRentalPrice;
    private double taxableAmount;
    private double gstRate; // e.g. 0.05
    private double gstAmount;
    private double finalPayableAmount;

    // MongoDB Customer Verification Status
    private int qualifyingBookingCount;
    private boolean isExistingCustomer;

    public CouponValidationResponse() {
        this.gstRate = 0.05;
    }

    public static CouponValidationResponse success(String code, String title, String description,
                                                    double discountPercent, double discountAmount,
                                                    double originalTotal, double discountedTotal,
                                                    String message, String applicableUserType) {
        CouponValidationResponse resp = new CouponValidationResponse();
        resp.setValid(true);
        resp.setCode(code);
        resp.setTitle(title);
        resp.setDescription(description);
        resp.setDiscountPercent(discountPercent);
        resp.setDiscountAmount(discountAmount);
        resp.setOriginalTotal(originalTotal);
        resp.setDiscountedTotal(discountedTotal);
        resp.setMessage(message);
        resp.setApplicableUserType(applicableUserType);
        return resp;
    }

    public static CouponValidationResponse successWithBreakdown(
            String code, String title, String description,
            double discountPercent, double discountAmount,
            double baseRentalPrice, double taxableAmount,
            double gstRate, double gstAmount, double finalPayableAmount,
            String message, String applicableUserType,
            int qualifyingBookingCount, boolean isExistingCustomer) {
        CouponValidationResponse resp = new CouponValidationResponse();
        resp.setValid(true);
        resp.setCode(code);
        resp.setTitle(title);
        resp.setDescription(description);
        resp.setDiscountPercent(discountPercent);
        resp.setDiscountAmount(discountAmount);
        resp.setBaseRentalPrice(baseRentalPrice);
        resp.setTaxableAmount(taxableAmount);
        resp.setGstRate(gstRate);
        resp.setGstAmount(gstAmount);
        resp.setFinalPayableAmount(finalPayableAmount);
        resp.setOriginalTotal(baseRentalPrice);
        resp.setDiscountedTotal(finalPayableAmount);
        resp.setMessage(message);
        resp.setApplicableUserType(applicableUserType);
        resp.setQualifyingBookingCount(qualifyingBookingCount);
        resp.setExistingCustomer(isExistingCustomer);
        return resp;
    }

    public static CouponValidationResponse failure(String code, String message) {
        CouponValidationResponse resp = new CouponValidationResponse();
        resp.setValid(false);
        resp.setCode(code);
        resp.setMessage(message);
        return resp;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

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

    public double getOriginalTotal() { return originalTotal; }
    public void setOriginalTotal(double originalTotal) { this.originalTotal = originalTotal; }

    public double getDiscountedTotal() { return discountedTotal; }
    public void setDiscountedTotal(double discountedTotal) { this.discountedTotal = discountedTotal; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getApplicableUserType() { return applicableUserType; }
    public void setApplicableUserType(String applicableUserType) { this.applicableUserType = applicableUserType; }

    public double getBaseRentalPrice() { return baseRentalPrice; }
    public void setBaseRentalPrice(double baseRentalPrice) { this.baseRentalPrice = baseRentalPrice; }

    public double getTaxableAmount() { return taxableAmount; }
    public void setTaxableAmount(double taxableAmount) { this.taxableAmount = taxableAmount; }

    public double getGstRate() { return gstRate; }
    public void setGstRate(double gstRate) { this.gstRate = gstRate; }

    public double getGstAmount() { return gstAmount; }
    public void setGstAmount(double gstAmount) { this.gstAmount = gstAmount; }

    public double getFinalPayableAmount() { return finalPayableAmount; }
    public void setFinalPayableAmount(double finalPayableAmount) { this.finalPayableAmount = finalPayableAmount; }

    public int getQualifyingBookingCount() { return qualifyingBookingCount; }
    public void setQualifyingBookingCount(int qualifyingBookingCount) { this.qualifyingBookingCount = qualifyingBookingCount; }

    public boolean isExistingCustomer() { return isExistingCustomer; }
    public void setExistingCustomer(boolean existingCustomer) { isExistingCustomer = existingCustomer; }
}
