package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.CustomerLoyaltyDocument;
import io.ridemate.carrental.mongodb.document.RentalAuditLogDocument;
import io.ridemate.carrental.mongodb.dto.CustomerLoyaltyResponse;
import io.ridemate.carrental.mongodb.repository.AuditLogMongoRepository;
import io.ridemate.carrental.mongodb.repository.CustomerLoyaltyMongoRepository;
import io.ridemate.carrental.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class CustomerLoyaltyService {

    private static final Logger log = LoggerFactory.getLogger(CustomerLoyaltyService.class);

    private final CustomerLoyaltyMongoRepository loyaltyMongoRepository;
    private final BookingRepository bookingRepository;
    private final CouponService couponService;
    private final AuditLogMongoRepository auditLogMongoRepository;

    public CustomerLoyaltyService(CustomerLoyaltyMongoRepository loyaltyMongoRepository,
                                  BookingRepository bookingRepository,
                                  CouponService couponService,
                                  AuditLogMongoRepository auditLogMongoRepository) {
        this.loyaltyMongoRepository = loyaltyMongoRepository;
        this.bookingRepository = bookingRepository;
        this.couponService = couponService;
        this.auditLogMongoRepository = auditLogMongoRepository;
    }

    public CustomerLoyaltyResponse getCustomerLoyalty(String customerEmail, String customerName) {
        String cleanEmail = customerEmail != null ? customerEmail.trim().toLowerCase() : "";
        int jpaCount = (int) bookingRepository.countByCustomerEmail(cleanEmail);

        CustomerLoyaltyDocument loyaltyDoc = loyaltyMongoRepository.findByCustomerEmailIgnoreCase(cleanEmail)
                .orElseGet(() -> {
                    CustomerLoyaltyDocument doc = new CustomerLoyaltyDocument(cleanEmail, customerName != null ? customerName : "Valued Customer");
                    doc.setTotalBookings(jpaCount);
                    return doc;
                });

        int totalBookings = Math.max(jpaCount, loyaltyDoc.getTotalBookings());
        loyaltyDoc.setTotalBookings(totalBookings);

        CustomerLoyaltyResponse resp = new CustomerLoyaltyResponse();
        resp.setCustomerEmail(cleanEmail);
        resp.setCustomerName(loyaltyDoc.getCustomerName() != null ? loyaltyDoc.getCustomerName() : (customerName != null ? customerName : "Driver"));
        resp.setTotalBookings(totalBookings);
        resp.setTotalSpent(loyaltyDoc.getTotalSpent());
        resp.setLoyaltyPoints(loyaltyDoc.getLoyaltyPoints());

        if (totalBookings == 0) {
            resp.setLoyaltyTier("GUEST");
            resp.setTierBadgeTitle("First-Time Guest");
            resp.setDefaultDiscountPercent(10.0);
            resp.setRecommendedCouponCode("FIRST10");
        } else if (totalBookings <= 2) {
            resp.setLoyaltyTier("SILVER");
            resp.setTierBadgeTitle("Silver Regular Member");
            resp.setDefaultDiscountPercent(15.0);
            resp.setRecommendedCouponCode("REGULAR15");
        } else if (totalBookings <= 4) {
            resp.setLoyaltyTier("GOLD");
            resp.setTierBadgeTitle("Gold VIP Member");
            resp.setDefaultDiscountPercent(20.0);
            resp.setRecommendedCouponCode("VIP20");
        } else {
            resp.setLoyaltyTier("PLATINUM");
            resp.setTierBadgeTitle("Platinum Executive Elite");
            resp.setDefaultDiscountPercent(25.0);
            resp.setRecommendedCouponCode("VIP20");
        }

        resp.setEligibleCoupons(couponService.getAvailableCoupons(cleanEmail));
        return resp;
    }

    public void recordBookingSuccess(String customerEmail, String customerName, double amountPaid, String couponUsed) {
        if (customerEmail == null || customerEmail.isBlank()) return;
        String cleanEmail = customerEmail.trim().toLowerCase();

        try {
            CustomerLoyaltyDocument doc = loyaltyMongoRepository.findByCustomerEmailIgnoreCase(cleanEmail)
                    .orElseGet(() -> new CustomerLoyaltyDocument(cleanEmail, customerName));

            doc.setTotalBookings(doc.getTotalBookings() + 1);
            doc.setTotalSpent(doc.getTotalSpent() + amountPaid);
            int newPoints = (int) (amountPaid / 10.0);
            doc.setLoyaltyPoints(doc.getLoyaltyPoints() + newPoints);
            doc.setLastBookingDate(LocalDateTime.now().toLocalDate().toString());
            doc.setUpdatedAt(LocalDateTime.now());

            if (couponUsed != null && !couponUsed.isBlank()) {
                if (!doc.getUsedCoupons().contains(couponUsed)) {
                    doc.getUsedCoupons().add(couponUsed);
                }
            }

            // Update tier
            if (doc.getTotalBookings() >= 5) doc.setLoyaltyTier("PLATINUM");
            else if (doc.getTotalBookings() >= 3) doc.setLoyaltyTier("GOLD");
            else doc.setLoyaltyTier("SILVER");

            loyaltyMongoRepository.save(doc);

            auditLogMongoRepository.save(new RentalAuditLogDocument(
                    "BOOKING_PERSISTED_MONGO",
                    cleanEmail,
                    "Booking completed. Added " + newPoints + " loyalty points. Total trips: " + doc.getTotalBookings(),
                    "{\"amount\":" + amountPaid + ",\"coupon\":\"" + couponUsed + "\"}"
            ));
        } catch (Exception e) {
            log.warn("MongoDB loyalty update skipped: {}", e.getMessage());
        }
    }
}
