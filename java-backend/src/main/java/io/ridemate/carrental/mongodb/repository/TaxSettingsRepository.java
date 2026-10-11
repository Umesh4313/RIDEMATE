package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.TaxSettingsDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxSettingsRepository extends MongoRepository<TaxSettingsDocument, String> {
}
