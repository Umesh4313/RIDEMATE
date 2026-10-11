package io.ridemate.carrental.mongodb;

import io.ridemate.carrental.mongodb.document.CouponDocument;
import io.ridemate.carrental.mongodb.document.CustomerLoyaltyDocument;
import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import io.ridemate.carrental.mongodb.dto.CouponSummaryDto;
import io.ridemate.carrental.mongodb.dto.CouponValidationResponse;
import io.ridemate.carrental.mongodb.dto.ValidateCouponRequest;
import io.ridemate.carrental.mongodb.repository.AuditLogMongoRepository;
import io.ridemate.carrental.mongodb.repository.CouponMongoRepository;
import io.ridemate.carrental.mongodb.repository.CustomerLoyaltyMongoRepository;
import io.ridemate.carrental.mongodb.repository.MongoBookingRepository;
import io.ridemate.carrental.mongodb.service.CouponService;
import io.ridemate.carrental.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class CouponServiceTest {

    @Mock
    private CouponMongoRepository couponMongoRepository;

    @Mock
    private CustomerLoyaltyMongoRepository loyaltyMongoRepository;

    @Mock
    private AuditLogMongoRepository auditLogMongoRepository;

    @Mock
    private MongoBookingRepository mongoBookingRepository;

    @Mock
    private BookingRepository bookingRepository;

    private CouponService couponService;

    @BeforeEach
    void setUp() {
        couponService = new CouponService(
                couponMongoRepository,
                loyaltyMongoRepository,
                auditLogMongoRepository,
                mongoBookingRepository,
                bookingRepository
        );

        // Standard mock coupons
        when(couponMongoRepository.findByCodeIgnoreCaseAndActiveTrue("NEWREG10"))
                .thenReturn(Optional.of(new CouponDocument("NEWREG10", "New Registration Coupon — 10% OFF",
                        "10% discount", 10.0, "FIRST_TIME", 1, 5000.0)));

        when(couponMongoRepository.findByCodeIgnoreCaseAndActiveTrue("EXISTING5"))
                .thenReturn(Optional.of(new CouponDocument("EXISTING5", "Existing Customer Coupon — 5% OFF",
                        "5% discount", 5.0, "EXISTING", 1, 3000.0)));
    }

    @Test
    @DisplayName("Rule 1: New customer with zero qualifying bookings sees only the 10% coupon")
    void testNewCustomerSeesOnly10PercentCoupon() {
        String newCustomerEmail = "newuser@example.com";
        when(mongoBookingRepository.findByCustomerEmailIgnoreCase(newCustomerEmail))
                .thenReturn(Collections.emptyList());
        when(loyaltyMongoRepository.findByCustomerEmailIgnoreCase(newCustomerEmail))
                .thenReturn(Optional.empty());
        when(bookingRepository.findByCustomerEmail(newCustomerEmail))
                .thenReturn(Collections.emptyList());

        List<CouponSummaryDto> available = couponService.getAvailableCoupons(newCustomerEmail);

        assertEquals(1, available.size(), "Must offer only 1 applicable coupon");
        CouponSummaryDto coupon = available.get(0);
        assertEquals("NEWREG10", coupon.getCode());
        assertEquals(10.0, coupon.getDiscountPercent());
        assertTrue(coupon.isRecommended());
    }

    @Test
    @DisplayName("Rule 2: Existing customer with >=1 qualifying bookings sees only the 5% coupon")
    void testExistingCustomerSeesOnly5PercentCoupon() {
        String existingEmail = "existing@example.com";
        MongoBookingDocument priorBooking = new MongoBookingDocument();
        priorBooking.setCustomerEmail(existingEmail);
        priorBooking.setStatus("Confirmed");
        priorBooking.setPaymentStatus("PAID");

        when(mongoBookingRepository.findByCustomerEmailIgnoreCase(existingEmail))
                .thenReturn(List.of(priorBooking));
        when(loyaltyMongoRepository.findByCustomerEmailIgnoreCase(existingEmail))
                .thenReturn(Optional.empty());
        when(bookingRepository.findByCustomerEmail(existingEmail))
                .thenReturn(Collections.emptyList());

        List<CouponSummaryDto> available = couponService.getAvailableCoupons(existingEmail);

        assertEquals(1, available.size(), "Must offer only 1 applicable coupon");
        CouponSummaryDto coupon = available.get(0);
        assertEquals("EXISTING5", coupon.getCode());
        assertEquals(5.0, coupon.getDiscountPercent());
        assertTrue(coupon.isRecommended());
    }

    @Test
    @DisplayName("Rule 1: New customer successfully validates NEWREG10 and gets correct price breakdown with 5% GST")
    void testNewCustomerApplies10PercentCoupon() {
        String newCustomerEmail = "newuser@example.com";
        when(mongoBookingRepository.findByCustomerEmailIgnoreCase(newCustomerEmail))
                .thenReturn(Collections.emptyList());

        ValidateCouponRequest req = new ValidateCouponRequest("NEWREG10", newCustomerEmail, 3, 6000.0, 6000.0);
        CouponValidationResponse resp = couponService.validateCoupon(req);

        assertTrue(resp.isValid());
        assertEquals("NEWREG10", resp.getCode());
        assertEquals(10.0, resp.getDiscountPercent());
        assertEquals(600.0, resp.getDiscountAmount(), 0.001); // 10% of 6000 = 600
        assertEquals(5400.0, resp.getTaxableAmount(), 0.001); // 6000 - 600 = 5400
        assertEquals(0.05, resp.getGstRate(), 0.001);
        assertEquals(270.0, resp.getGstAmount(), 0.001); // 5% of 5400 = 270
        assertEquals(5670.0, resp.getFinalPayableAmount(), 0.001); // 5400 + 270 = 5670
    }

    @Test
    @DisplayName("Rule 2: Existing customer validates EXISTING5 and gets correct price breakdown with 5% GST")
    void testExistingCustomerApplies5PercentCoupon() {
        String existingEmail = "existing@example.com";
        MongoBookingDocument completedBooking = new MongoBookingDocument();
        completedBooking.setCustomerEmail(existingEmail);
        completedBooking.setStatus("Completed");
        completedBooking.setPaymentStatus("PAID");

        when(mongoBookingRepository.findByCustomerEmailIgnoreCase(existingEmail))
                .thenReturn(List.of(completedBooking));

        ValidateCouponRequest req = new ValidateCouponRequest("EXISTING5", existingEmail, 3, 6000.0, 6000.0);
        CouponValidationResponse resp = couponService.validateCoupon(req);

        assertTrue(resp.isValid());
        assertEquals("EXISTING5", resp.getCode());
        assertEquals(5.0, resp.getDiscountPercent());
        assertEquals(300.0, resp.getDiscountAmount(), 0.001); // 5% of 6000 = 300
        assertEquals(5700.0, resp.getTaxableAmount(), 0.001); // 6000 - 300 = 5700
        assertEquals(0.05, resp.getGstRate(), 0.001);
        assertEquals(285.0, resp.getGstAmount(), 0.001); // 5% of 5700 = 285
        assertEquals(5985.0, resp.getFinalPayableAmount(), 0.001); // 5700 + 285 = 5985
    }

    @Test
    @DisplayName("Rule 6: Existing customer CANNOT manually use or manipulate the 10% new registration coupon")
    void testExistingCustomerCannotUseNewRegistrationCoupon() {
        String existingEmail = "existing@example.com";
        MongoBookingDocument pastBooking = new MongoBookingDocument();
        pastBooking.setCustomerEmail(existingEmail);
        pastBooking.setStatus("Completed");

        when(mongoBookingRepository.findByCustomerEmailIgnoreCase(existingEmail))
                .thenReturn(List.of(pastBooking));

        ValidateCouponRequest req = new ValidateCouponRequest("NEWREG10", existingEmail, 2, 6000.0, 6000.0);
        CouponValidationResponse resp = couponService.validateCoupon(req);

        assertFalse(resp.isValid(), "Existing customer should be rejected from using NEWREG10");
        assertTrue(resp.getMessage().contains("exclusively for new customers"), "Error message must guide the customer");
    }

    @Test
    @DisplayName("Rule 4: Cancelled or failed bookings do NOT count towards qualifying bookings")
    void testCancelledBookingsDoNotDisqualifyNewCustomer() {
        String customerWithCancelled = "cancelled_only@example.com";
        MongoBookingDocument cancelledBooking = new MongoBookingDocument();
        cancelledBooking.setCustomerEmail(customerWithCancelled);
        cancelledBooking.setStatus("Cancelled");

        MongoBookingDocument failedBooking = new MongoBookingDocument();
        failedBooking.setCustomerEmail(customerWithCancelled);
        failedBooking.setStatus("Failed");
        failedBooking.setPaymentStatus("FAILED");

        when(mongoBookingRepository.findByCustomerEmailIgnoreCase(customerWithCancelled))
                .thenReturn(List.of(cancelledBooking, failedBooking));

        int qualifyingCount = couponService.getCustomerQualifyingBookingCount(customerWithCancelled);
        assertEquals(0, qualifyingCount, "Cancelled and Failed bookings must not count as qualifying bookings");

        List<CouponSummaryDto> coupons = couponService.getAvailableCoupons(customerWithCancelled);
        assertEquals(1, coupons.size());
        assertEquals("NEWREG10", coupons.get(0).getCode(), "Customer with only cancelled bookings should still get 10% new customer coupon");
    }
}
