package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.CustomerLoyaltyDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerLoyaltyMongoRepository extends MongoRepository<CustomerLoyaltyDocument, String> {
    Optional<CustomerLoyaltyDocument> findByCustomerEmailIgnoreCase(String customerEmail);
}
