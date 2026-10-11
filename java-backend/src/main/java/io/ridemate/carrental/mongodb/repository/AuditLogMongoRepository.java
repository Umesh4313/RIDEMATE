package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.RentalAuditLogDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogMongoRepository extends MongoRepository<RentalAuditLogDocument, String> {
    List<RentalAuditLogDocument> findTop25ByOrderByTimestampDesc();
    List<RentalAuditLogDocument> findByActorOrderByTimestampDesc(String actor);
}
