package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface MongoBookingRepository extends MongoRepository<MongoBookingDocument, String> {
    Optional<MongoBookingDocument> findByPickupCode(String pickupCode);
    List<MongoBookingDocument> findByCustomerEmailIgnoreCase(String customerEmail);
    List<MongoBookingDocument> findByCustomerEmailIgnoreCaseAndStatusIn(String customerEmail, Collection<String> statuses);
    long countByCustomerEmailIgnoreCaseAndStatusIn(String customerEmail, Collection<String> statuses);
    List<MongoBookingDocument> findByVehicleIdAndStatusIn(String vehicleId, Collection<String> statuses);
}
