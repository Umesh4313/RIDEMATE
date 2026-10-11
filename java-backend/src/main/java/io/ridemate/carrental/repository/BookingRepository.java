package io.ridemate.carrental.repository;

import io.ridemate.carrental.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    Optional<Booking> findByPickupCode(String pickupCode);
    List<Booking> findByCustomerEmail(String customerEmail);
    long countByCustomerEmail(String customerEmail);
    List<Booking> findByStatus(String status);
    List<Booking> findByCustomerEmailAndStatus(String customerEmail, String status);
}
