package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.PolicySettingsDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PolicySettingsRepository extends MongoRepository<PolicySettingsDocument, String> {
}
