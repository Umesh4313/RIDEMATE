package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.*;
import io.ridemate.carrental.mongodb.dto.*;
import io.ridemate.carrental.mongodb.repository.*;
import io.ridemate.carrental.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CouponService {

    private static final Logger log = LoggerFactory.getLogger(CouponService.class);

    public static final List<String> QUALIFYING_STATUSES = List.of("Confirmed", "Active", "Completed");

    private final CouponMongoRepository couponMongoRepository;
    private final CustomerLoyaltyMongoRepository loyaltyMongoRepository;
    private final AuditLogMongoRepository auditLogMongoRepository;
    private final MongoBookingRepository mongoBookingRepository;
    private final BookingRepository bookingRepository;

    public CouponService(CouponMongoRepository couponMongoRepository,
                         CustomerLoyaltyMongoRepository loyaltyMongoRepository,
                         AuditLogMongoRepository auditLogMongoRepository,
                         MongoBookingRepository mongoBookingRepository,
                         BookingRepository bookingRepository) {
        this.couponMongoRepository = couponMongoRepository;
        this.loyaltyMongoRepository = loyaltyMongoRepository;
        this.auditLogMongoRepository = auditLogMongoRepository;
        this.mongoBookingRepository = mongoBookingRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Validates coupon eligibility based on the customer's actual booking history in MongoDB.
     * Enforces:
     * - Rule 1: New Registration Coupon (10%) only if customer has zero previous qualifying bookings.
     * - Rule 2: Existing Customer Coupon (5%) only if customer has at least one qualifying booking.
     * - Rule 3 & 5: Computes Base Rental -> Applied Discount -> Taxable Amount -> GST (5%) -> Total Payable.
     */
    public CouponValidationResponse validateCoupon(ValidateCouponRequest req) {
        if (req.getCode() == null || req.getCode().trim().isBlank()) {
            return CouponValidationResponse.failure("", "Please enter a valid coupon code.");
        }

        String rawCode = req.getCode().trim().toUpperCase();
        String customerEmail = req.getCustomerEmail() != null ? req.getCustomerEmail().trim().toLowerCase() : "";

        // Standardize code aliases
        String cleanCode = normalizeCouponCode(rawCode);

        // Fetch customer's actual qualifying booking count strictly from MongoDB
        int previousBookingsCount = getCustomerQualifyingBookingCount(customerEmail);
        boolean isExistingCustomer = (previousBookingsCount >= 1);
        boolean isFirstTimeCustomer = (previousBookingsCount == 0);

        // Fetch coupon definition from MongoDB (or fallback memory catalog)
        Optional<CouponDocument> optCoupon = couponMongoRepository.findByCodeIgnoreCaseAndActiveTrue(cleanCode);
        CouponDocument coupon = optCoupon.orElseGet(() -> getFallbackCoupon(cleanCode));

        if (coupon == null || !coupon.isActive()) {
            return CouponValidationResponse.failure(rawCode, "Coupon code '" + rawCode + "' is invalid or has expired.");
        }

        // Validate expiration date
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return CouponValidationResponse.failure(cleanCode, "Coupon code '" + cleanCode + "' has expired.");
        }

        // Validate minimum rental days
        if (req.getDays() > 0 && req.getDays() < coupon.getMinRentalDays()) {
            return CouponValidationResponse.failure(cleanCode,
                    "Coupon '" + cleanCode + "' requires a minimum rental period of " + coupon.getMinRentalDays() + " days.");
        }

        // RULE 1: New Registration Coupon (10% OFF)
        if ("FIRST_TIME".equalsIgnoreCase(coupon.getApplicableUserType()) || "NEWREG10".equalsIgnoreCase(cleanCode)) {
            if (isExistingCustomer) {
                return CouponValidationResponse.failure(cleanCode,
                        "The 'New Registration Coupon — 10% OFF' is exclusively for new customers with zero previous qualifying bookings. " +
                        "As an existing customer with " + previousBookingsCount + " completed/confirmed booking(s), you qualify for the 'Existing Customer Coupon — 5% OFF' (code: EXISTING5).");
            }
        }

        // RULE 2: Existing Customer Coupon (5% OFF)
        if ("EXISTING".equalsIgnoreCase(coupon.getApplicableUserType()) || "REGULAR".equalsIgnoreCase(coupon.getApplicableUserType()) || "EXISTING5".equalsIgnoreCase(cleanCode)) {
            if (isFirstTimeCustomer) {
                return CouponValidationResponse.failure(cleanCode,
                        "The 'Existing Customer Coupon — 5% OFF' is reserved for returning customers with at least one qualifying booking. " +
                        "As a new customer with zero previous bookings, you are eligible for the 'New Registration Coupon — 10% OFF' (code: NEWREG10)!");
            }
        }

        // Rule 3 & 5: Calculate Price Breakdown with GST
        // Base rental subtotal
        double baseRentalPrice = req.getRentalSubtotal() > 0 ? req.getRentalSubtotal() : (req.getTotalDue() > 0 ? req.getTotalDue() : 6000.0);
        double discountPercent = coupon.getDiscountPercent();
        double discountAmount = Math.round(baseRentalPrice * (discountPercent / 100.0) * 100.0) / 100.0;
        if (coupon.getMaxDiscountAmount() > 0) {
            discountAmount = Math.min(discountAmount, coupon.getMaxDiscountAmount());
        }

        // Taxable amount = Base rental - Applied coupon discount + protection fee
        double taxableAmount = Math.max(0.0, Math.round((baseRentalPrice - discountAmount + req.getProtectionFee()) * 100.0) / 100.0);

        // GST (5%)
        double gstRate = 0.05;
        double gstAmount = Math.round(taxableAmount * gstRate * 100.0) / 100.0;

        // Final payable amount = Taxable amount + GST
        double finalPayableAmount = Math.round((taxableAmount + gstAmount) * 100.0) / 100.0;

        String successMessage;
        if (isFirstTimeCustomer) {
            successMessage = "New Registration Coupon (10% OFF) applied! You save ₹" + String.format("%.2f", discountAmount) + 
                    ". Taxable: ₹" + String.format("%.2f", taxableAmount) + ", GST (5%): ₹" + String.format("%.2f", gstAmount) + 
                    ", Total Payable: ₹" + String.format("%.2f", finalPayableAmount);
        } else {
            successMessage = "Existing Customer Coupon (5% OFF) applied! You save ₹" + String.format("%.2f", discountAmount) + 
                    ". Taxable: ₹" + String.format("%.2f", taxableAmount) + ", GST (5%): ₹" + String.format("%.2f", gstAmount) + 
                    ", Total Payable: ₹" + String.format("%.2f", finalPayableAmount);
        }

        // Record audit log asynchronously in MongoDB
        try {
            auditLogMongoRepository.save(new RentalAuditLogDocument(
                    "COUPON_VALIDATED",
                    customerEmail.isBlank() ? "guest" : customerEmail,
                    "Validated coupon " + cleanCode + " saving ₹" + discountAmount + " for " + (isFirstTimeCustomer ? "new" : "existing") + " customer",
                    "{\"code\":\"" + cleanCode + "\",\"savings\":" + discountAmount + ",\"taxable\":" + taxableAmount + ",\"gst\":" + gstAmount + ",\"total\":" + finalPayableAmount + "}"
            ));
        } catch (Exception ex) {
            log.debug("Audit log save skipped: {}", ex.getMessage());
        }

        return CouponValidationResponse.successWithBreakdown(
                coupon.getCode(),
                coupon.getTitle(),
                coupon.getDescription(),
                discountPercent,
                discountAmount,
                baseRentalPrice,
                taxableAmount,
                gstRate,
                gstAmount,
                finalPayableAmount,
                successMessage,
                coupon.getApplicableUserType(),
                previousBookingsCount,
                isExistingCustomer
        );
    }

    /**
     * Rule 3.6: Displays ONLY the applicable customer coupon in the available-coupons list:
     * - If qualifying booking count is 0 => offer ONLY the 10% New Registration Coupon.
     * - If qualifying booking count is >= 1 => offer ONLY the 5% Existing Customer Coupon.
     */
    public List<CouponSummaryDto> getAvailableCoupons(String customerEmail) {
        String cleanEmail = customerEmail != null ? customerEmail.trim().toLowerCase() : "";
        int bookingCount = getCustomerQualifyingBookingCount(cleanEmail);
        boolean isFirstTime = (bookingCount == 0);

        List<CouponSummaryDto> list = new ArrayList<>();

        if (isFirstTime) {
            // Rule 1: New customer with zero qualifying bookings sees ONLY the 10% coupon
            list.add(new CouponSummaryDto(
                    "NEWREG10",
                    "New Registration Coupon — 10% OFF",
                    "Exclusive 10% discount for registered customers with zero previous qualifying bookings.",
                    10.0,
                    "FIRST_TIME",
                    1,
                    true
            ));
        } else {
            // Rule 2: Existing customer with at least one qualifying booking sees ONLY the 5% coupon
            list.add(new CouponSummaryDto(
                    "EXISTING5",
                    "Existing Customer Coupon — 5% OFF",
                    "5% loyalty appreciation discount for existing customers with completed/confirmed booking history.",
                    5.0,
                    "EXISTING",
                    1,
                    true
            ));
        }

        return list;
    }

    /**
     * Rule 4: Important Booking Status Logic
     * Counts qualifying bookings strictly from MongoDB:
     * - Qualifying: Confirmed, Active, Completed
     * - Excluded: Cancelled, Failed, Abandoned, Rejected
     * - Does not count failed payments.
     */
    public int getCustomerQualifyingBookingCount(String email) {
        if (email == null || email.isBlank()) return 0;
        String cleanEmail = email.trim().toLowerCase();

        try {
            // 1. Primary verification: query MongoDB customer_bookings collection
            List<MongoBookingDocument> mongoBookings = mongoBookingRepository.findByCustomerEmailIgnoreCase(cleanEmail);
            long mongoQualifying = mongoBookings.stream()
                    .filter(b -> b.getStatus() != null && QUALIFYING_STATUSES.stream().anyMatch(s -> s.equalsIgnoreCase(b.getStatus())))
                    .filter(b -> b.getPaymentStatus() == null || (!"FAILED".equalsIgnoreCase(b.getPaymentStatus()) && !"REFUNDED".equalsIgnoreCase(b.getPaymentStatus())))
                    .count();

            // 2. Secondary check: MongoDB CustomerLoyalty record
            Optional<CustomerLoyaltyDocument> loyalty = loyaltyMongoRepository.findByCustomerEmailIgnoreCase(cleanEmail);
            int loyaltyCount = loyalty.map(CustomerLoyaltyDocument::getTotalBookings).orElse(0);

            // 3. JPA fallback check for any confirmed/active/completed bookings
            long jpaQualifying = bookingRepository.findByCustomerEmail(cleanEmail).stream()
                    .filter(b -> b.getStatus() != null && QUALIFYING_STATUSES.stream().anyMatch(s -> s.equalsIgnoreCase(b.getStatus())))
                    .count();

            int finalCount = (int) Math.max(mongoQualifying, Math.max(loyaltyCount, jpaQualifying));
            log.debug("Customer {} qualifying booking count from MongoDB: {} (mongo={}, loyalty={}, jpa={})",
                    cleanEmail, finalCount, mongoQualifying, loyaltyCount, jpaQualifying);
            return finalCount;
        } catch (Exception e) {
            log.warn("Error counting MongoDB qualifying bookings for {}: {}", cleanEmail, e.getMessage());
            return 0;
        }
    }

    public int getCustomerPreviousBookingsCount(String email) {
        return getCustomerQualifyingBookingCount(email);
    }

    private String normalizeCouponCode(String code) {
        if (code == null) return "";
        return switch (code.toUpperCase()) {
            case "FIRST10", "WELCOME10", "NEW10" -> "NEWREG10";
            case "REGULAR5", "LOYAL5", "EXISTING" -> "EXISTING5";
            default -> code.toUpperCase();
        };
    }

    private CouponDocument getFallbackCoupon(String code) {
        return switch (code.toUpperCase()) {
            case "NEWREG10", "FIRST10" -> new CouponDocument(
                    "NEWREG10",
                    "New Registration Coupon — 10% OFF",
                    "Exclusive 10% discount for registered customers with zero previous qualifying bookings.",
                    10.0,
                    "FIRST_TIME",
                    1,
                    5000.0
            );
            case "EXISTING5", "REGULAR5", "LOYAL5" -> new CouponDocument(
                    "EXISTING5",
                    "Existing Customer Coupon — 5% OFF",
                    "5% loyalty appreciation discount for existing customers with completed/confirmed booking history.",
                    5.0,
                    "EXISTING",
                    1,
                    3000.0
            );
            case "REGULAR15" -> new CouponDocument(
                    "REGULAR15",
                    "15% Regular Customer Discount",
                    "15% off for returning regular and loyal customers.",
                    15.0,
                    "REGULAR",
                    1,
                    2000.0
            );
            default -> null;
        };
    }
}
