package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.RentalAuditLogDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MongoAuditLogRepository extends MongoRepository<RentalAuditLogDocument, String> {
    List<RentalAuditLogDocument> findAllByOrderByTimestampDesc();
}
