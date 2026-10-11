package io.ridemate.carrental.repository;

import io.ridemate.carrental.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, String> {
    List<Car> findByStatus(String status);
    List<Car> findByCategory(String category);
    List<Car> findByLocation(String location);
    List<Car> findByStatusAndCategory(String status, String category);
}
