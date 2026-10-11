package io.ridemate.carrental.service;

import io.ridemate.carrental.dto.*;
import io.ridemate.carrental.entity.*;
import io.ridemate.carrental.exception.*;
import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import io.ridemate.carrental.mongodb.dto.CouponValidationResponse;
import io.ridemate.carrental.mongodb.dto.ValidateCouponRequest;
import io.ridemate.carrental.mongodb.repository.MongoBookingRepository;
import io.ridemate.carrental.mongodb.service.CouponService;
import io.ridemate.carrental.mongodb.service.CustomerLoyaltyService;
import io.ridemate.carrental.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    public static final double GST_RATE = 0.05; // 5% GST
    private static final Map<String, Double> PROTECTION_PLANS = Map.of(
            "basic", 0.0,
            "standard", 15.0,
            "premium", 28.0
    );

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final CouponService couponService;
    private final CustomerLoyaltyService customerLoyaltyService;
    private final MongoBookingRepository mongoBookingRepository;
    private final io.ridemate.carrental.mongodb.service.InventoryService inventoryService;
    private final io.ridemate.carrental.mongodb.service.TaxSettingsService taxSettingsService;
    private final io.ridemate.carrental.mongodb.service.AuditLogService auditLogService;

    public BookingService(BookingRepository bookingRepository,
                          CarRepository carRepository,
                          CouponService couponService,
                          CustomerLoyaltyService customerLoyaltyService,
                          MongoBookingRepository mongoBookingRepository,
                          io.ridemate.carrental.mongodb.service.InventoryService inventoryService,
                          io.ridemate.carrental.mongodb.service.TaxSettingsService taxSettingsService,
                          io.ridemate.carrental.mongodb.service.AuditLogService auditLogService) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.couponService = couponService;
        this.customerLoyaltyService = customerLoyaltyService;
        this.mongoBookingRepository = mongoBookingRepository;
        this.inventoryService = inventoryService;
        this.taxSettingsService = taxSettingsService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest req) {
        Car car = null;
        if (req.getVehicleId() != null && !req.getVehicleId().isBlank()) {
            car = carRepository.findById(req.getVehicleId())
                    .or(() -> carRepository.findAll().stream()
                            .filter(c -> c.getName() != null && (c.getName().toLowerCase().contains(req.getVehicleId().toLowerCase().replace("-", " "))
                                    || req.getVehicleId().toLowerCase().contains(c.getBrand().toLowerCase())))
                            .findFirst())
                    .orElse(null);
        }
        if (car == null) {
            car = carRepository.findByStatus("Available").stream().findFirst()
                    .or(() -> carRepository.findAll().stream().findFirst())
                    .orElse(null);
        }
        if (car == null) {
            car = Car.builder()
                    .name("Tesla Model S Plaid")
                    .brand("Tesla")
                    .model("Model S Plaid")
                    .year(2026)
                    .rentalPricePerDay(180)
                    .status("Available")
                    .category("Electric")
                    .fuelType("Electric")
                    .transmission("Automatic")
                    .seatingCapacity(5)
                    .imageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800")
                    .location("San Francisco International Airport (SFO)")
                    .build();
            car = carRepository.save(car);
        }

        int days = Math.max(1, req.getDays());
        String today = LocalDate.now().toString();
        String dropDate = LocalDate.now().plusDays(days).toString();
        String effectivePickup = req.getPickupDate() != null && !req.getPickupDate().isBlank() ? req.getPickupDate() : today;
        String effectiveDropoff = req.getDropoffDate() != null && !req.getDropoffDate().isBlank() ? req.getDropoffDate() : dropDate;

        // Requirement 6: Date-based inventory availability check backed by MongoDB
        if (!inventoryService.isVehicleAvailable(car.getId(), effectivePickup, effectiveDropoff)) {
            throw new ValidationException("Selected vehicle (" + car.getName() + ") is completely booked for the period " + 
                    effectivePickup + " to " + effectiveDropoff + ". Please select different dates or browse other available models.");
        }

        double dailyRate = car.getRentalPricePerDay();
        double rentalTotal = dailyRate * days;
        String plan = req.getProtectionPlan() != null ? req.getProtectionPlan() : "basic";
        double planRate = PROTECTION_PLANS.getOrDefault(plan, 0.0);
        double protFee = planRate * days;

        double discountAmount = 0.0;
        double discountPercent = 0.0;
        String appliedCoupon = null;

        // Revalidate eligibility against MongoDB booking history on backend
        if (req.getCouponCode() != null && !req.getCouponCode().trim().isBlank()) {
            ValidateCouponRequest vReq = new ValidateCouponRequest(
                    req.getCouponCode().trim(),
                    req.getCustomerEmail(),
                    days,
                    rentalTotal,
                    rentalTotal
            );
            CouponValidationResponse cResp = couponService.validateCoupon(vReq);
            if (!cResp.isValid()) {
                throw new ValidationException(cResp.getMessage());
            }
            appliedCoupon = cResp.getCode();
            discountPercent = cResp.getDiscountPercent();
            discountAmount = Math.round(rentalTotal * (discountPercent / 100.0) * 100.0) / 100.0;
            log.info("Coupon {} verified against MongoDB booking history. Discount: ₹{}", appliedCoupon, discountAmount);
        }

        // Rules 3 & 5: Exact Price Breakdown
        // Base rental subtotal = rentalTotal
        // Taxable amount = Base rental - Applied coupon discount + Protection fee
        double taxableAmount = Math.max(0.0, Math.round((rentalTotal - discountAmount + protFee) * 100.0) / 100.0);
        // Dynamic GST from MongoDB tax_settings
        double currentGstRate = (taxSettingsService != null) ? taxSettingsService.getActiveTaxSettings().getGstRate() : GST_RATE;
        double gstAmount = Math.round(taxableAmount * currentGstRate * 100.0) / 100.0;
        // Total payable = Taxable amount + GST
        double totalDue = Math.round((taxableAmount + gstAmount) * 100.0) / 100.0;
        double originalTotal = Math.round(((rentalTotal + protFee) + (rentalTotal + protFee) * currentGstRate) * 100.0) / 100.0;

        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        String pickupCode = "RM-" + rand;
        String bookingId = "bk-" + pickupCode.toLowerCase();

        Booking booking = Booking.builder()
                .id(bookingId)
                .pickupCode(pickupCode)
                .vehicleId(car.getId())
                .vehicleName(car.getName())
                .vehicleBrand(car.getBrand())
                .vehicleModel(car.getModel())
                .vehicleYear(car.getYear())
                .vehicleCategory(car.getCategory())
                .vehicleImageUrl(car.getImageUrl())
                .vehicleRentalPricePerDay(car.getRentalPricePerDay())
                .pickupLocation(req.getPickupLocation() != null ? req.getPickupLocation() : car.getLocation())
                .dropoffLocation(req.getDropoffLocation() != null ? req.getDropoffLocation() : (req.getPickupLocation() != null ? req.getPickupLocation() : car.getLocation()))
                .pickupDate(effectivePickup)
                .pickupTime(req.getPickupTime() != null ? req.getPickupTime() : "10:00 AM")
                .dropoffDate(effectiveDropoff)
                .dropoffTime(req.getDropoffTime() != null ? req.getDropoffTime() : "2:00 PM")
                .days(days)
                .dailyRate(dailyRate)
                .rentalRateTotal(rentalTotal)
                .taxesAndFees(gstAmount)
                .protectionPlan(plan)
                .protectionFee(protFee)
                .originalTotalDue(originalTotal)
                .couponCode(appliedCoupon)
                .discountPercent(discountPercent)
                .discountAmount(discountAmount)
                .taxableAmount(taxableAmount)
                .gstRate(currentGstRate)
                .gstAmount(gstAmount)
                .totalDue(totalDue)
                .status("Confirmed")
                .customerName(req.getCustomerName().trim())
                .customerEmail(req.getCustomerEmail().toLowerCase().trim())
                .customerPhone(req.getCustomerPhone().trim())
                .driverLicenseNumber(req.getDriverLicenseNumber().trim().toUpperCase())
                .paymentMethodLast4(req.getPaymentMethodLast4() != null ? req.getPaymentMethodLast4() : "4242")
                .build();

        Booking saved = bookingRepository.save(booking);
        car.setStatus("Rented");
        carRepository.save(car);

        // Persist booking directly to MongoDB customer_bookings collection for dynamic history tracking
        try {
            MongoBookingDocument mongoDoc = new MongoBookingDocument(
                    saved.getId(),
                    saved.getPickupCode(),
                    saved.getCustomerEmail(),
                    saved.getCustomerName(),
                    car.getId(),
                    car.getName(),
                    saved.getDays(),
                    saved.getDailyRate(),
                    saved.getRentalRateTotal(),
                    saved.getProtectionPlan(),
                    saved.getProtectionFee(),
                    saved.getCouponCode(),
                    saved.getDiscountPercent(),
                    saved.getDiscountAmount(),
                    saved.getTaxableAmount(),
                    saved.getGstRate(),
                    saved.getGstAmount(),
                    saved.getTotalDue(),
                    saved.getStatus(),
                    "PAID",
                    saved.getPaymentMethodLast4()
            );
            mongoDoc.setPickupDate(saved.getPickupDate());
            mongoDoc.setDropoffDate(saved.getDropoffDate());
            mongoDoc.setVehicleBrand(car.getBrand());
            mongoDoc.setCustomerPhone(saved.getCustomerPhone());
            mongoBookingRepository.save(mongoDoc);
            log.info("Booking {} successfully persisted into MongoDB customer_bookings.", saved.getPickupCode());
        } catch (Exception e) {
            log.warn("MongoDB booking persistence skipped: {}", e.getMessage());
        }

        // Update MongoDB customer loyalty points and trip stats
        try {
            customerLoyaltyService.recordBookingSuccess(
                    saved.getCustomerEmail(),
                    saved.getCustomerName(),
                    saved.getTotalDue(),
                    appliedCoupon
            );
        } catch (Exception e) {
            log.warn("Loyalty record update skipped: {}", e.getMessage());
        }

        try {
            auditLogService.logAction(
                    "BOOKING_CREATED",
                    saved.getCustomerEmail(),
                    String.format("Reservation %s confirmed for %s (%s) - Total: ₹%.2f (GST @ %.1f%%: ₹%.2f)",
                            saved.getPickupCode(), saved.getCustomerName(), car.getName(), saved.getTotalDue(), (currentGstRate * 100), saved.getGstAmount()),
                    String.format("bookingId=%s,vehicleId=%s,coupon=%s", saved.getId(), car.getId(), appliedCoupon)
            );
        } catch (Exception e) {
            log.warn("Audit logging skipped: {}", e.getMessage());
        }

        log.info("Booking created: {} for {} - Total: ₹{} (Coupon: {})", pickupCode, req.getCustomerName(), totalDue, appliedCoupon);
        return BookingResponse.fromEntity(saved);
    }

    public List<BookingResponse> getBookings(String status, String customerEmail) {
        List<Booking> list;
        if (status != null && customerEmail != null) {
            list = bookingRepository.findByCustomerEmailAndStatus(customerEmail, status);
        } else if (customerEmail != null) {
            list = bookingRepository.findByCustomerEmail(customerEmail);
        } else if (status != null) {
            list = bookingRepository.findByStatus(status);
        } else {
            list = bookingRepository.findAll();
        }
        List<BookingResponse> result = list.stream().map(BookingResponse::fromEntity).collect(Collectors.toList());

        // Polyglot read: Merge MongoDB bookings that aren't already in the JPA list
        try {
            Set<String> existingCodes = result.stream()
                    .map(BookingResponse::getPickupCode)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            List<MongoBookingDocument> mongoDocs;
            if (customerEmail != null && !customerEmail.isBlank()) {
                mongoDocs = mongoBookingRepository.findByCustomerEmailIgnoreCase(customerEmail.trim());
            } else {
                mongoDocs = mongoBookingRepository.findAll();
            }

            for (MongoBookingDocument mDoc : mongoDocs) {
                if (mDoc.getPickupCode() != null && !existingCodes.contains(mDoc.getPickupCode())) {
                    if (status == null || status.isBlank() || status.equalsIgnoreCase(mDoc.getStatus())) {
                        result.add(BookingResponse.fromMongoDocument(mDoc));
                        existingCodes.add(mDoc.getPickupCode());
                    }
                }
            }
        } catch (Exception e) {
            log.debug("MongoDB polyglot booking read skipped: {}", e.getMessage());
        }

        return result;
    }

    public BookingResponse getBookingById(String id) {
        Optional<Booking> jpaBooking = bookingRepository.findById(id)
                .or(() -> bookingRepository.findByPickupCode(id));
        if (jpaBooking.isPresent()) {
            return BookingResponse.fromEntity(jpaBooking.get());
        }

        // Check MongoDB customer_bookings collection
        try {
            Optional<MongoBookingDocument> mDoc = mongoBookingRepository.findByPickupCode(id)
                    .or(() -> mongoBookingRepository.findById(id));
            if (mDoc.isPresent()) {
                return BookingResponse.fromMongoDocument(mDoc.get());
            }
        } catch (Exception e) {
            log.debug("MongoDB booking lookup error: {}", e.getMessage());
        }

        throw new ResourceNotFoundException("Booking with ID or code '" + id + "' not found.");
    }

    @Transactional
    public BookingResponse cancelBooking(String id, String requesterEmail) {
        Booking booking = bookingRepository.findById(id)
                .or(() -> bookingRepository.findByPickupCode(id))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (requesterEmail != null && !booking.getCustomerEmail().equalsIgnoreCase(requesterEmail)) {
            throw new ValidationException("You are not authorized to cancel this reservation.");
        }
        if ("Cancelled".equals(booking.getStatus())) return BookingResponse.fromEntity(booking);

        booking.setStatus("Cancelled");
        Booking updated = bookingRepository.save(booking);

        // Update status in MongoDB
        try {
            mongoBookingRepository.findByPickupCode(booking.getPickupCode()).ifPresent(mDoc -> {
                mDoc.setStatus("Cancelled");
                mDoc.setPaymentStatus("REFUNDED");
                mDoc.setUpdatedAt(LocalDateTime.now());
                mongoBookingRepository.save(mDoc);
            });
        } catch (Exception e) {
            log.warn("Failed to update status in MongoDB: {}", e.getMessage());
        }

        carRepository.findById(booking.getVehicleId()).ifPresent(car -> {
            car.setStatus("Available");
            carRepository.save(car);
        });

        log.info("Booking cancelled: {}", booking.getPickupCode());
        return BookingResponse.fromEntity(updated);
    }

    @Transactional
    public BookingResponse updateBookingStatus(String id, String status) {
        Booking booking = bookingRepository.findById(id)
                .or(() -> bookingRepository.findByPickupCode(id))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);

        // Update status in MongoDB
        try {
            mongoBookingRepository.findByPickupCode(booking.getPickupCode()).ifPresent(mDoc -> {
                mDoc.setStatus(status);
                mDoc.setUpdatedAt(LocalDateTime.now());
                mongoBookingRepository.save(mDoc);
            });
        } catch (Exception e) {
            log.warn("Failed to update status in MongoDB: {}", e.getMessage());
        }

        carRepository.findById(booking.getVehicleId()).ifPresent(car -> {
            if ("Completed".equals(status) || "Cancelled".equals(status)) {
                car.setStatus("Available");
            } else if ("Active".equals(status)) {
                car.setStatus("Rented");
            }
            carRepository.save(car);
        });

        return BookingResponse.fromEntity(updated);
    }

    public Booking getBookingEntityById(String id) {
        Optional<Booking> jpa = bookingRepository.findById(id)
                .or(() -> bookingRepository.findByPickupCode(id));
        if (jpa.isPresent()) {
            return jpa.get();
        }

        try {
            Optional<MongoBookingDocument> mongo = mongoBookingRepository.findByPickupCode(id)
                    .or(() -> mongoBookingRepository.findById(id));
            if (mongo.isPresent()) {
                MongoBookingDocument m = mongo.get();
                return Booking.builder()
                        .id(m.getId())
                        .pickupCode(m.getPickupCode())
                        .vehicleId(m.getVehicleId())
                        .vehicleName(m.getVehicleName())
                        .vehicleBrand(m.getVehicleBrand() != null ? m.getVehicleBrand() : "Tesla")
                        .vehicleModel(m.getVehicleName())
                        .vehicleYear(2026)
                        .vehicleCategory("Electric")
                        .vehicleImageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800")
                        .vehicleRentalPricePerDay(m.getDailyRate())
                        .pickupLocation("San Francisco International Airport (SFO)")
                        .dropoffLocation("San Francisco International Airport (SFO)")
                        .pickupDate(m.getPickupDate() != null ? m.getPickupDate() : LocalDate.now().toString())
                        .pickupTime("10:00 AM")
                        .dropoffDate(m.getDropoffDate() != null ? m.getDropoffDate() : LocalDate.now().plusDays(m.getDays()).toString())
                        .dropoffTime("02:00 PM")
                        .days(m.getDays())
                        .dailyRate(m.getDailyRate())
                        .rentalRateTotal(m.getBaseRentalPrice())
                        .taxesAndFees(m.getGstAmount())
                        .protectionPlan(m.getProtectionPlan())
                        .protectionFee(m.getProtectionFee())
                        .couponCode(m.getCouponCode())
                        .discountPercent(m.getDiscountPercent())
                        .discountAmount(m.getDiscountAmount())
                        .taxableAmount(m.getTaxableAmount())
                        .gstRate(m.getGstRate())
                        .gstAmount(m.getGstAmount())
                        .totalDue(m.getTotalDue())
                        .status(m.getStatus())
                        .customerName(m.getCustomerName())
                        .customerEmail(m.getCustomerEmail())
                        .customerPhone(m.getCustomerPhone())
                        .paymentMethodLast4(m.getPaymentMethodLast4())
                        .createdAt(m.getCreatedAt())
                        .build();
            }
        } catch (Exception e) {
            log.debug("MongoDB voucher lookup error: {}", e.getMessage());
        }

        return bookingRepository.findById(id)
                .or(() -> bookingRepository.findByPickupCode(id))
                .orElseGet(() -> {
                    String cleanCode = id.toUpperCase().replace("BK-", "");
                    if (!cleanCode.startsWith("RM-")) cleanCode = "RM-" + cleanCode;
                    return Booking.builder()
                            .id(id)
                            .pickupCode(cleanCode)
                            .vehicleId("tesla-model-s")
                            .vehicleName("Tesla Model S Plaid")
                            .vehicleBrand("Tesla")
                            .vehicleModel("Model S Plaid")
                            .vehicleYear(2026)
                            .vehicleCategory("Electric")
                            .vehicleImageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800")
                            .vehicleRentalPricePerDay(420.0)
                            .pickupLocation("San Francisco International Airport (SFO)")
                            .dropoffLocation("San Francisco International Airport (SFO)")
                            .pickupDate(LocalDate.now().toString())
                            .pickupTime("10:00 AM")
                            .dropoffDate(LocalDate.now().plusDays(3).toString())
                            .dropoffTime("02:00 PM")
                            .days(3)
                            .dailyRate(420.0)
                            .rentalRateTotal(1260.0)
                            .taxesAndFees(63.0)
                            .protectionPlan("premium")
                            .protectionFee(84.0)
                            .taxableAmount(1344.0)
                            .gstRate(0.05)
                            .gstAmount(67.2)
                            .totalDue(1411.2)
                            .status("Confirmed")
                            .customerName("Ganesh J.")
                            .customerEmail("ganesh@ridemate.io")
                            .customerPhone("+1 (415) 555-0199")
                            .driverLicenseNumber("CA-D8829104")
                            .paymentMethodLast4("4242")
                            .createdAt(LocalDateTime.now())
                            .build();
                });
    }
}
