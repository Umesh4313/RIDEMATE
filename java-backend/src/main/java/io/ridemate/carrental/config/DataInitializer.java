package io.ridemate.carrental.config;

import io.ridemate.carrental.entity.*;
import io.ridemate.carrental.mongodb.document.CouponDocument;
import io.ridemate.carrental.mongodb.document.CustomerLoyaltyDocument;
import io.ridemate.carrental.mongodb.repository.CouponMongoRepository;
import io.ridemate.carrental.mongodb.repository.CustomerLoyaltyMongoRepository;
import io.ridemate.carrental.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final CouponMongoRepository couponMongoRepository;
    private final CustomerLoyaltyMongoRepository loyaltyMongoRepository;
    private final io.ridemate.carrental.mongodb.repository.MongoBookingRepository mongoBookingRepository;

    public DataInitializer(UserRepository userRepository,
                           CarRepository carRepository,
                           BookingRepository bookingRepository,
                           PasswordEncoder passwordEncoder,
                           CouponMongoRepository couponMongoRepository,
                           CustomerLoyaltyMongoRepository loyaltyMongoRepository,
                           io.ridemate.carrental.mongodb.repository.MongoBookingRepository mongoBookingRepository) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
        this.couponMongoRepository = couponMongoRepository;
        this.loyaltyMongoRepository = loyaltyMongoRepository;
        this.mongoBookingRepository = mongoBookingRepository;
    }

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            seedUsers();
            seedCars();
            seedBookings();
            seedMongoCouponsAndLoyalty();
        };
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;
        log.info("Seeding default users...");

        String hash = passwordEncoder.encode("password123");

        userRepository.save(User.builder()
                .name("Ganesh J.")
                .email("ganesh@ridemate.io")
                .passwordHash(hash)
                .role(Role.ROLE_ADMIN)
                .phone("+1 (415) 555-0199")
                .driverLicenseNumber("CA-D8829104")
                .build());

        userRepository.save(User.builder()
                .name("Ganesh J. (MET)")
                .email("ganeshj.bca_iom@bkc.met.edu")
                .passwordHash(hash)
                .role(Role.ROLE_ADMIN)
                .phone("+1 (415) 555-0199")
                .driverLicenseNumber("CA-D8829104")
                .build());

        userRepository.save(User.builder()
                .name("Marcus Vance")
                .email("ops@ridemate.io")
                .passwordHash(hash)
                .role(Role.ROLE_OPERATIONS)
                .phone("+1 (415) 555-0144")
                .build());

        userRepository.save(User.builder()
                .name("Sophia Laurent")
                .email("sophia@example.com")
                .passwordHash(hash)
                .role(Role.ROLE_CUSTOMER)
                .phone("+1 (415) 555-0182")
                .driverLicenseNumber("CA-L994821")
                .build());

        log.info("Default users seeded.");
    }

    private void seedCars() {
        if (carRepository.count() > 0) return;
        log.info("Seeding default cars...");

        carRepository.save(Car.builder()
                .name("Tesla Model S Plaid")
                .brand("Tesla").model("Model S Plaid").year(2026)
                .registrationNumber("7XYZ123").vin("5YJSA1E68MF123456")
                .category("Electric").fuelType("Electric").transmission("Automatic")
                .seatingCapacity(5).color("Midnight Silver").mileage(1200).price(130000)
                .rentalPricePerDay(420).discount(0).status("Available")
                .imageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800")
                .imagesJson("[\"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800\"]")
                .description("The pinnacle of electric performance. 0-60 in 1.99 seconds.")
                .location("San Francisco International Airport (SFO)")
                .luggageBags(4).mpgOrRange("396mi Range").rating(4.9).reviewsCount(128)
                .specsJson("{\"engine\":\"Tri Motor Electric\",\"acceleration\":\"1.99s 0-60\",\"topSpeed\":\"200 mph\",\"drivetrain\":\"AWD\",\"climate\":\"Tri-Zone\"}")
                .build());

        carRepository.save(Car.builder()
                .name("BMW M3 Competition")
                .brand("BMW").model("M3 Competition").year(2026)
                .registrationNumber("M3COMP01").vin("WBS80DZ08NCF12345")
                .category("Sports").fuelType("Gas").transmission("Automatic")
                .seatingCapacity(4).color("Alpine White").mileage(800).price(85000)
                .rentalPricePerDay(280).discount(5).status("Available")
                .imageUrl("https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=800")
                .imagesJson("[\"https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=800\"]")
                .description("The legendary sport sedan with M TwinPower Turbo inline-6.")
                .location("Los Angeles International Airport (LAX)")
                .luggageBags(3).mpgOrRange("22/30 MPG").rating(4.8).reviewsCount(95)
                .specsJson("{\"engine\":\"3.0L TwinTurbo I6 503hp\",\"acceleration\":\"3.5s 0-60\",\"topSpeed\":\"180 mph\",\"drivetrain\":\"RWD\",\"climate\":\"Dual-Zone\"}")
                .build());

        carRepository.save(Car.builder()
                .name("Mercedes-Benz GLE 63 AMG")
                .brand("Mercedes-Benz").model("GLE 63 AMG").year(2025)
                .registrationNumber("GLE63A01").vin("4JGFB6BB3MA123456")
                .category("SUV").fuelType("Hybrid").transmission("Automatic")
                .seatingCapacity(5).color("Obsidian Black").mileage(2100).price(115000)
                .rentalPricePerDay(350).discount(10).status("Available")
                .imageUrl("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800")
                .imagesJson("[\"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800\"]")
                .description("Commanding presence meets AMG performance in a luxury SUV.")
                .location("New York JFK Airport")
                .luggageBags(6).mpgOrRange("18/25 MPG").rating(4.7).reviewsCount(74)
                .specsJson("{\"engine\":\"4.0L Biturbo V8 603hp\",\"acceleration\":\"3.7s 0-60\",\"topSpeed\":\"174 mph\",\"drivetrain\":\"4MATIC+\",\"climate\":\"Tri-Zone\"}")
                .build());

        carRepository.save(Car.builder()
                .name("Porsche 911 Carrera S")
                .brand("Porsche").model("911 Carrera S").year(2026)
                .registrationNumber("P911CS01").vin("WP0AB2A91NS123456")
                .category("Sports").fuelType("Gas").transmission("Automatic")
                .seatingCapacity(2).color("Guards Red").mileage(600).price(140000)
                .rentalPricePerDay(480).discount(0).status("Available")
                .imageUrl("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800")
                .imagesJson("[\"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800\"]")
                .description("An icon reimagined. Twin-turbocharged flat-six perfection.")
                .location("Miami International Airport")
                .luggageBags(1).mpgOrRange("18/24 MPG").rating(5.0).reviewsCount(52)
                .specsJson("{\"engine\":\"3.0L Twin-Turbo Flat-6 450hp\",\"acceleration\":\"3.3s 0-60\",\"topSpeed\":\"191 mph\",\"drivetrain\":\"RWD\",\"climate\":\"Dual-Zone\"}")
                .build());

        log.info("Default cars seeded.");
    }

    private void seedBookings() {
        if (bookingRepository.count() > 0) return;
        log.info("Seeding default bookings...");

        bookingRepository.save(Booking.builder()
                .id("bk-rm-8472")
                .pickupCode("RM-8472")
                .vehicleId("tesla-model-y")
                .vehicleName("Tesla Model Y Long Range")
                .vehicleBrand("Tesla")
                .vehicleModel("Model Y")
                .vehicleYear(2024)
                .vehicleCategory("Electric")
                .vehicleImageUrl("https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800")
                .vehicleRentalPricePerDay(142.0)
                .pickupLocation("San Francisco International Airport (SFO), Terminal 2")
                .dropoffLocation("San Francisco International Airport (SFO), Terminal 2")
                .pickupDate("2026-10-24")
                .pickupTime("10:00 AM")
                .dropoffDate("2026-10-27")
                .dropoffTime("02:00 PM")
                .days(3)
                .dailyRate(142.0)
                .rentalRateTotal(426.0)
                .taxesAndFees(48.25)
                .protectionPlan("standard")
                .protectionFee(45.0)
                .totalDue(519.25)
                .status("Confirmed")
                .customerName("Ganesh J.")
                .customerEmail("ganesh@ridemate.io")
                .customerPhone("+1 (415) 555-0199")
                .driverLicenseNumber("CA-D8829104")
                .paymentMethodLast4("4242")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());

        bookingRepository.save(Booking.builder()
                .id("bk-rm-3190")
                .pickupCode("RM-3190")
                .vehicleId("bmw-m3")
                .vehicleName("BMW M3 Competition")
                .vehicleBrand("BMW")
                .vehicleModel("M3")
                .vehicleYear(2026)
                .vehicleCategory("Sports")
                .vehicleImageUrl("https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=800")
                .vehicleRentalPricePerDay(280.0)
                .pickupLocation("Los Angeles International Airport (LAX)")
                .dropoffLocation("Los Angeles International Airport (LAX)")
                .pickupDate("2026-07-14")
                .pickupTime("09:00 AM")
                .dropoffDate("2026-07-18")
                .dropoffTime("11:00 AM")
                .days(4)
                .dailyRate(280.0)
                .rentalRateTotal(1120.0)
                .taxesAndFees(126.0)
                .protectionPlan("standard")
                .protectionFee(60.0)
                .totalDue(1306.0)
                .status("Completed")
                .customerName("Ganesh J.")
                .customerEmail("ganesh@ridemate.io")
                .customerPhone("+1 (415) 555-0199")
                .driverLicenseNumber("CA-D8829104")
                .paymentMethodLast4("4242")
                .createdAt(LocalDateTime.now().minusMonths(3))
                .build());

        log.info("Default bookings seeded.");
    }

    private void seedMongoCouponsAndLoyalty() {
        try {
            if (couponMongoRepository.count() == 0) {
                log.info("Seeding MongoDB discount coupons...");
                couponMongoRepository.save(new CouponDocument(
                        "NEWREG10",
                        "New Registration Coupon — 10% OFF",
                        "Exclusive 10% discount for registered customers with zero previous qualifying bookings.",
                        10.0,
                        "FIRST_TIME",
                        1,
                        5000.0
                ));
                couponMongoRepository.save(new CouponDocument(
                        "EXISTING5",
                        "Existing Customer Coupon — 5% OFF",
                        "5% loyalty appreciation discount for existing customers with completed/confirmed booking history.",
                        5.0,
                        "EXISTING",
                        1,
                        3000.0
                ));
                couponMongoRepository.save(new CouponDocument(
                        "FIRST10",
                        "10% First-Time Customer Discount",
                        "Exclusive 10% discount for all new first-time customers upon their first booking.",
                        10.0,
                        "FIRST_TIME",
                        1,
                        1500.0
                ));
                couponMongoRepository.save(new CouponDocument(
                        "REGULAR15",
                        "15% Regular Customer Loyalty Discount",
                        "15% appreciation reward for our regular and returning members.",
                        15.0,
                        "REGULAR",
                        1,
                        2000.0
                ));
                log.info("Seeded MongoDB discount coupons (NEWREG10, EXISTING5, FIRST10).");
            }

            if (loyaltyMongoRepository.count() == 0) {
                log.info("Seeding MongoDB customer loyalty records...");
                CustomerLoyaltyDocument sophia = new CustomerLoyaltyDocument("sophia@example.com", "Sophia Laurent");
                sophia.setTotalBookings(2);
                sophia.setTotalSpent(890.0);
                sophia.setLoyaltyTier("SILVER");
                sophia.setLoyaltyPoints(89);
                loyaltyMongoRepository.save(sophia);

                CustomerLoyaltyDocument ganesh = new CustomerLoyaltyDocument("ganesh@ridemate.io", "Ganesh J.");
                ganesh.setTotalBookings(2);
                ganesh.setTotalSpent(1825.25);
                ganesh.setLoyaltyTier("SILVER");
                ganesh.setLoyaltyPoints(182);
                loyaltyMongoRepository.save(ganesh);
                log.info("Seeded initial MongoDB customer loyalty tiers.");
            }

            // Sync existing bookings from JPA into MongoDB customer_bookings collection
            if (mongoBookingRepository.count() == 0) {
                log.info("Synchronizing existing bookings into MongoDB customer_bookings collection...");
                bookingRepository.findAll().forEach(b -> {
                    mongoBookingRepository.save(new io.ridemate.carrental.mongodb.document.MongoBookingDocument(
                            b.getId(),
                            b.getPickupCode(),
                            b.getCustomerEmail(),
                            b.getCustomerName(),
                            b.getVehicleId(),
                            b.getVehicleName(),
                            b.getDays(),
                            b.getDailyRate(),
                            b.getRentalRateTotal(),
                            b.getProtectionPlan(),
                            b.getProtectionFee(),
                            b.getCouponCode(),
                            b.getDiscountPercent(),
                            b.getDiscountAmount(),
                            b.getTaxableAmount() > 0 ? b.getTaxableAmount() : b.getRentalRateTotal(),
                            0.05,
                            b.getGstAmount() > 0 ? b.getGstAmount() : b.getTaxesAndFees(),
                            b.getTotalDue(),
                            b.getStatus(),
                            "PAID",
                            b.getPaymentMethodLast4()
                    ));
                });
                log.info("Synchronized bookings into MongoDB customer_bookings collection.");
            }
        } catch (Exception ex) {
            log.warn("MongoDB initial seed skipped (check connection): {}", ex.getMessage());
        }
    }
}
