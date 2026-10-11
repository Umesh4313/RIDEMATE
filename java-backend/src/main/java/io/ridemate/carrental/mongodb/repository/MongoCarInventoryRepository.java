package io.ridemate.carrental.mongodb.repository;

import io.ridemate.carrental.mongodb.document.MongoCarInventoryDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MongoCarInventoryRepository extends MongoRepository<MongoCarInventoryDocument, String> {
    Optional<MongoCarInventoryDocument> findByModelNameIgnoreCase(String modelName);
    List<MongoCarInventoryDocument> findByCategoryIgnoreCase(String category);
    List<MongoCarInventoryDocument> findByBrandIgnoreCase(String brand);
}
