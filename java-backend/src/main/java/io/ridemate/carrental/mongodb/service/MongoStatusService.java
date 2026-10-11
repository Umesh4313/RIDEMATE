package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.repository.*;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MongoStatusService {

    private static final Logger log = LoggerFactory.getLogger(MongoStatusService.class);

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017/ridemate}")
    private String mongoUri;

    private final MongoTemplate mongoTemplate;
    private final CouponMongoRepository couponMongoRepository;
    private final CustomerLoyaltyMongoRepository loyaltyMongoRepository;
    private final AuditLogMongoRepository auditLogMongoRepository;
    private final MongoBookingRepository bookingMongoRepository;
    private final MongoCarInventoryRepository inventoryMongoRepository;

    public MongoStatusService(MongoTemplate mongoTemplate,
                              CouponMongoRepository couponMongoRepository,
                              CustomerLoyaltyMongoRepository loyaltyMongoRepository,
                              AuditLogMongoRepository auditLogMongoRepository,
                              MongoBookingRepository bookingMongoRepository,
                              MongoCarInventoryRepository inventoryMongoRepository) {
        this.mongoTemplate = mongoTemplate;
        this.couponMongoRepository = couponMongoRepository;
        this.loyaltyMongoRepository = loyaltyMongoRepository;
        this.auditLogMongoRepository = auditLogMongoRepository;
        this.bookingMongoRepository = bookingMongoRepository;
        this.inventoryMongoRepository = inventoryMongoRepository;
    }

    public Map<String, Object> getMongoStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        try {
            long start = System.currentTimeMillis();
            Document ping = mongoTemplate.executeCommand("{ ping: 1 }");
            long latencyMs = System.currentTimeMillis() - start;

            status.put("connected", true);
            status.put("database", mongoTemplate.getDb().getName());
            status.put("latencyMs", latencyMs);
            status.put("pingResponse", ping.getDouble("ok") == 1.0 ? "OK" : ping.toJson());

            Set<String> collections = mongoTemplate.getCollectionNames();
            status.put("collections", collections);

            Map<String, Long> counts = new LinkedHashMap<>();
            counts.put("coupons", couponMongoRepository.count());
            counts.put("customer_loyalty", loyaltyMongoRepository.count());
            counts.put("customer_bookings", bookingMongoRepository.count());
            counts.put("car_inventory", inventoryMongoRepository.count());
            counts.put("audit_logs", auditLogMongoRepository.count());
            status.put("documentCounts", counts);

            status.put("status", "HEALTHY");
            status.put("host", mongoUri != null ? mongoUri : "mongodb://localhost:27017/ridemate");
        } catch (Exception ex) {
            log.warn("MongoDB ping failed: {}", ex.getMessage());
            status.put("connected", false);
            status.put("status", "DEGRADED");
            status.put("error", ex.getMessage());
            status.put("host", mongoUri != null ? mongoUri : "mongodb://localhost:27017/ridemate");
        }
        return status;
    }
}
