package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.CustomerLoyaltyDocument;
import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import io.ridemate.carrental.mongodb.dto.CustomerProfileDto;
import io.ridemate.carrental.mongodb.repository.CustomerLoyaltyMongoRepository;
import io.ridemate.carrental.mongodb.repository.MongoBookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminOperationsService {

    private static final Logger log = LoggerFactory.getLogger(AdminOperationsService.class);

    private final MongoBookingRepository bookingRepository;
    private final CustomerLoyaltyMongoRepository loyaltyRepository;
    private final AuditLogService auditLogService;

    public AdminOperationsService(MongoBookingRepository bookingRepository,
                                  CustomerLoyaltyMongoRepository loyaltyRepository,
                                  AuditLogService auditLogService) {
        this.bookingRepository = bookingRepository;
        this.loyaltyRepository = loyaltyRepository;
        this.auditLogService = auditLogService;
    }

    public List<CustomerProfileDto> getCustomers(String query) {
        List<MongoBookingDocument> allBookings = bookingRepository.findAll();
        Map<String, List<MongoBookingDocument>> bookingsByEmail = allBookings.stream()
                .filter(b -> b.getCustomerEmail() != null && !b.getCustomerEmail().isBlank())
                .collect(Collectors.groupingBy(b -> b.getCustomerEmail().toLowerCase().trim()));

        List<CustomerLoyaltyDocument> allLoyalty = loyaltyRepository.findAll();
        Map<String, CustomerLoyaltyDocument> loyaltyByEmail = allLoyalty.stream()
                .collect(Collectors.toMap(
                        l -> l.getCustomerEmail().toLowerCase().trim(),
                        l -> l,
                        (existing, replace) -> existing
                ));

        // Set of all emails
        Set<String> emails = new HashSet<>(bookingsByEmail.keySet());
        emails.addAll(loyaltyByEmail.keySet());

        List<CustomerProfileDto> list = new ArrayList<>();
        for (String email : emails) {
            List<MongoBookingDocument> custBookings = bookingsByEmail.getOrDefault(email, Collections.emptyList());
            CustomerLoyaltyDocument loyalty = loyaltyByEmail.get(email);

            CustomerProfileDto dto = new CustomerProfileDto();
            dto.setCustomerEmail(email);

            if (!custBookings.isEmpty()) {
                MongoBookingDocument latest = custBookings.get(custBookings.size() - 1);
                dto.setCustomerName(latest.getCustomerName());
                dto.setCustomerPhone(latest.getCustomerPhone());
                dto.setCustomerId("CUST-" + Math.abs(email.hashCode() % 90000 + 10000));
            } else if (loyalty != null) {
                dto.setCustomerName(loyalty.getCustomerName());
                dto.setCustomerId("CUST-" + Math.abs(email.hashCode() % 90000 + 10000));
            } else {
                dto.setCustomerName(email.split("@")[0]);
                dto.setCustomerId("CUST-99999");
            }

            dto.setMembershipTier(loyalty != null ? loyalty.getLoyaltyTier() : "STANDARD");
            dto.setLoyaltyPoints(loyalty != null ? loyalty.getLoyaltyPoints() : 0);

            long total = custBookings.size();
            long completed = custBookings.stream().filter(b -> "Completed".equalsIgnoreCase(b.getStatus())).count();
            long canceled = custBookings.stream().filter(b -> "Cancelled".equalsIgnoreCase(b.getStatus())).count();
            long upcoming = total - completed - canceled;

            double spent = custBookings.stream().mapToDouble(MongoBookingDocument::getTotalDue).sum();
            double discounts = custBookings.stream().mapToDouble(MongoBookingDocument::getDiscountAmount).sum();
            double refunds = custBookings.stream()
                    .filter(b -> "Cancelled".equalsIgnoreCase(b.getStatus()) || "REFUNDED".equalsIgnoreCase(b.getPaymentStatus()))
                    .mapToDouble(MongoBookingDocument::getTotalDue).sum();

            dto.setTotalBookings(total);
            dto.setCompletedRentals(completed);
            dto.setUpcomingRentals(Math.max(0, upcoming));
            dto.setCanceledBookings(canceled);
            dto.setTotalSpent(Math.round(spent * 100.0) / 100.0);
            dto.setDiscountsReceived(Math.round(discounts * 100.0) / 100.0);
            dto.setRefundsReceived(Math.round(refunds * 100.0) / 100.0);

            list.add(dto);
        }

        // Apply query filter (name, email, phone)
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase().trim();
            return list.stream().filter(c ->
                    (c.getCustomerName() != null && c.getCustomerName().toLowerCase().contains(q)) ||
                    (c.getCustomerEmail() != null && c.getCustomerEmail().toLowerCase().contains(q)) ||
                    (c.getCustomerPhone() != null && c.getCustomerPhone().contains(q)) ||
                    (c.getCustomerId() != null && c.getCustomerId().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        return list;
    }

    public List<MongoBookingDocument> getCustomerBookings(String customerEmail) {
        if (customerEmail == null || customerEmail.isBlank()) return Collections.emptyList();
        return bookingRepository.findByCustomerEmailIgnoreCase(customerEmail.trim());
    }

    public List<Map<String, Object>> getGeneratedVouchers(String search) {
        List<MongoBookingDocument> bookings = bookingRepository.findAll();
        List<Map<String, Object>> vouchers = new ArrayList<>();

        for (MongoBookingDocument b : bookings) {
            String vchRef = "VCH-" + b.getPickupCode();
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("voucherReference", vchRef);
            map.put("bookingReference", b.getPickupCode());
            map.put("bookingId", b.getId());
            map.put("customerName", b.getCustomerName());
            map.put("customerEmail", b.getCustomerEmail());
            map.put("vehicleName", b.getVehicleName());
            map.put("vehicleId", b.getVehicleId());
            map.put("pickupDate", b.getPickupDate());
            map.put("dropoffDate", b.getDropoffDate());
            map.put("days", b.getDays());
            map.put("baseRentalPrice", b.getBaseRentalPrice());
            map.put("discountAmount", b.getDiscountAmount());
            map.put("taxableAmount", b.getTaxableAmount());
            map.put("gstRate", b.getGstRate());
            map.put("gstAmount", b.getGstAmount());
            map.put("totalAmount", b.getTotalDue());
            map.put("status", b.getStatus());
            map.put("issueDate", b.getCreatedAt() != null ? b.getCreatedAt().toString() : "");
            map.put("voucherDownloadUrl", "/api/v1/bookings/" + b.getId() + "/voucher");

            vouchers.add(map);
        }

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase().trim();
            return vouchers.stream().filter(v ->
                    String.valueOf(v.get("voucherReference")).toLowerCase().contains(q) ||
                    String.valueOf(v.get("bookingReference")).toLowerCase().contains(q) ||
                    String.valueOf(v.get("customerName")).toLowerCase().contains(q) ||
                    String.valueOf(v.get("customerEmail")).toLowerCase().contains(q) ||
                    String.valueOf(v.get("vehicleName")).toLowerCase().contains(q)
            ).collect(Collectors.toList());
        }

        return vouchers;
    }

    public List<Map<String, Object>> getPaymentRecords(String search, String statusFilter) {
        List<MongoBookingDocument> bookings = bookingRepository.findAll();
        List<Map<String, Object>> payments = new ArrayList<>();

        for (MongoBookingDocument b : bookings) {
            String txnRef = "TXN-" + Math.abs((b.getId() + b.getPickupCode()).hashCode() % 900000 + 100000);
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("transactionReference", txnRef);
            map.put("bookingReference", b.getPickupCode());
            map.put("bookingId", b.getId());
            map.put("customerName", b.getCustomerName());
            map.put("customerEmail", b.getCustomerEmail());
            map.put("amountCharged", b.getTotalDue());
            map.put("currency", "INR (₹)");
            map.put("paymentMethod", "Credit/Debit Card (•••• " + (b.getPaymentMethodLast4() != null ? b.getPaymentMethodLast4() : "4242") + ")");
            map.put("paymentStatus", b.getPaymentStatus() != null ? b.getPaymentStatus() : "PAID");
            map.put("bookingStatus", b.getStatus());
            map.put("refundAmount", "Cancelled".equalsIgnoreCase(b.getStatus()) ? b.getTotalDue() : 0.0);
            map.put("transactionDate", b.getCreatedAt() != null ? b.getCreatedAt().toString() : "");
            map.put("taxAmount", b.getGstAmount());
            map.put("taxableAmount", b.getTaxableAmount());

            payments.add(map);
        }

        return payments.stream()
                .filter(p -> statusFilter == null || statusFilter.isBlank() || statusFilter.equalsIgnoreCase("All") ||
                        String.valueOf(p.get("paymentStatus")).equalsIgnoreCase(statusFilter))
                .filter(p -> search == null || search.isBlank() ||
                        String.valueOf(p.get("transactionReference")).toLowerCase().contains(search.toLowerCase()) ||
                        String.valueOf(p.get("bookingReference")).toLowerCase().contains(search.toLowerCase()) ||
                        String.valueOf(p.get("customerName")).toLowerCase().contains(search.toLowerCase()) ||
                        String.valueOf(p.get("customerEmail")).toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
    }
}
