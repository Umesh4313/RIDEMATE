package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.CouponDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponMongoRepository extends MongoRepository<CouponDocument, String> {
    Optional<CouponDocument> findByCodeIgnoreCaseAndActiveTrue(String code);
    Optional<CouponDocument> findByCodeIgnoreCase(String code);
    List<CouponDocument> findByActiveTrue();
    List<CouponDocument> findByApplicableUserTypeInAndActiveTrue(List<String> types);
}
