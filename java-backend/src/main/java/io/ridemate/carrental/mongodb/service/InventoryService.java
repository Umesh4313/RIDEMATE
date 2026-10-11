package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.IndividualVehicleDocument;
import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import io.ridemate.carrental.mongodb.document.MongoCarInventoryDocument;
import io.ridemate.carrental.mongodb.dto.CarAvailabilityDto;
import io.ridemate.carrental.mongodb.repository.MongoBookingRepository;
import io.ridemate.carrental.mongodb.repository.MongoCarInventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);
    private static final List<String> ACTIVE_STATUSES = List.of("Confirmed", "Active");

    private final MongoCarInventoryRepository inventoryRepository;
    private final MongoBookingRepository bookingRepository;

    public InventoryService(MongoCarInventoryRepository inventoryRepository,
                            MongoBookingRepository bookingRepository) {
        this.inventoryRepository = inventoryRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Calculates date-based availability for all car models in MongoDB for the requested period.
     * Available quantity = Total fleet - Vehicles in maintenance - Overlapping confirmed bookings.
     */
    public List<CarAvailabilityDto> getAvailabilityForPeriod(String pickupDateStr, String dropoffDateStr) {
        LocalDate start = parseDateOrDefault(pickupDateStr, LocalDate.now());
        LocalDate end = parseDateOrDefault(dropoffDateStr, start.plusDays(3));
        if (end.isBefore(start)) {
            end = start.plusDays(1);
        }

        final LocalDate reqStart = start;
        final LocalDate reqEnd = end;

        List<MongoCarInventoryDocument> allInventory = inventoryRepository.findAll();
        if (allInventory.isEmpty()) {
            allInventory = seedDefaultInventory();
        }

        return allInventory.stream()
                .map(car -> computeAvailability(car, reqStart, reqEnd))
                .collect(Collectors.toList());
    }

    /**
     * Calculates availability for a specific car model for the requested period.
     */
    public CarAvailabilityDto getCarAvailability(String carId, String pickupDateStr, String dropoffDateStr) {
        LocalDate start = parseDateOrDefault(pickupDateStr, LocalDate.now());
        LocalDate end = parseDateOrDefault(dropoffDateStr, start.plusDays(3));
        if (end.isBefore(start)) {
            end = start.plusDays(1);
        }

        MongoCarInventoryDocument car = inventoryRepository.findById(carId)
                .orElseGet(() -> {
                    // Try by model name
                    return inventoryRepository.findByModelNameIgnoreCase(carId)
                            .orElse(null);
                });

        if (car == null) {
            // Check if fallback inventory needed
            List<MongoCarInventoryDocument> seeded = seedDefaultInventory();
            car = seeded.stream().filter(c -> c.getId().equalsIgnoreCase(carId) || c.getModelName().equalsIgnoreCase(carId))
                    .findFirst().orElse(null);
        }

        if (car == null) {
            throw new NoSuchElementException("Car with ID '" + carId + "' not found in inventory.");
        }

        return computeAvailability(car, start, end);
    }

    /**
     * Checks if a vehicle model has at least 1 rentable vehicle available for requested dates.
     */
    public boolean isVehicleAvailable(String carId, String pickupDateStr, String dropoffDateStr) {
        try {
            CarAvailabilityDto dto = getCarAvailability(carId, pickupDateStr, dropoffDateStr);
            return dto.getAvailableQuantity() > 0;
        } catch (Exception ex) {
            log.warn("Inventory availability check error for {}: {}", carId, ex.getMessage());
            return true; // Graceful fallback
        }
    }

    /**
     * Admin fleet management: update total fleet quantity.
     * Validates that newQuantity cannot be reduced below current active commitments.
     */
    public MongoCarInventoryDocument updateFleetQuantity(String carId, int newQuantity) {
        if (newQuantity < 1) {
            throw new IllegalArgumentException("Fleet quantity must be at least 1.");
        }

        MongoCarInventoryDocument car = inventoryRepository.findById(carId)
                .orElseThrow(() -> new NoSuchElementException("Car model not found: " + carId));

        List<MongoBookingDocument> activeBookings = bookingRepository.findByVehicleIdAndStatusIn(car.getId(), ACTIVE_STATUSES);
        if (newQuantity < activeBookings.size()) {
            throw new IllegalArgumentException("Cannot reduce fleet quantity to " + newQuantity + 
                    ". There are currently " + activeBookings.size() + " active confirmed bookings committed to this model.");
        }

        car.setTotalFleetQuantity(newQuantity);

        // Synchronize individual vehicles list
        List<IndividualVehicleDocument> vehicles = car.getIndividualVehicles();
        if (vehicles == null) {
            vehicles = new ArrayList<>();
        }
        while (vehicles.size() < newQuantity) {
            int num = vehicles.size() + 1;
            String reg = String.format("MH-%02d-RM-%04d", (car.getBrand().hashCode() % 50 + 50) % 50, num * 100 + 1);
            vehicles.add(new IndividualVehicleDocument(
                    UUID.randomUUID().toString(),
                    reg,
                    "VIN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    "Available",
                    10000L + num * 2500L,
                    "Factory Color"
            ));
        }
        while (vehicles.size() > newQuantity) {
            vehicles.remove(vehicles.size() - 1);
        }

        car.setIndividualVehicles(vehicles);
        car.setUpdatedAt(LocalDateTime.now());
        MongoCarInventoryDocument saved = inventoryRepository.save(car);
        log.info("Admin updated fleet quantity for {} to {}", car.getModelName(), newQuantity);
        return saved;
    }

    /**
     * Admin fleet management: set maintenance status for an individual vehicle.
     */
    public MongoCarInventoryDocument setVehicleMaintenance(String carId, String registrationNumber, boolean inMaintenance) {
        MongoCarInventoryDocument car = inventoryRepository.findById(carId)
                .orElseThrow(() -> new NoSuchElementException("Car model not found: " + carId));

        boolean found = false;
        int maintCount = 0;
        for (IndividualVehicleDocument v : car.getIndividualVehicles()) {
            if (v.getRegistrationNumber().equalsIgnoreCase(registrationNumber)) {
                v.setStatus(inMaintenance ? "Maintenance" : "Available");
                found = true;
            }
            if ("Maintenance".equalsIgnoreCase(v.getStatus())) {
                maintCount++;
            }
        }

        if (!found) {
            throw new NoSuchElementException("Vehicle with registration " + registrationNumber + " not found in model " + car.getModelName());
        }

        car.setMaintenanceQuantity(maintCount);
        car.setUpdatedAt(LocalDateTime.now());
        MongoCarInventoryDocument saved = inventoryRepository.save(car);
        log.info("Updated maintenance for vehicle {} (inMaintenance={})", registrationNumber, inMaintenance);
        return saved;
    }

    /**
     * Saves or creates a car model in MongoDB inventory.
     */
    public MongoCarInventoryDocument saveCarModel(MongoCarInventoryDocument car) {
        if (car.getId() == null || car.getId().isBlank()) {
            car.setId(UUID.randomUUID().toString());
        }
        if (car.getIndividualVehicles() == null || car.getIndividualVehicles().isEmpty()) {
            List<IndividualVehicleDocument> vehicles = new ArrayList<>();
            for (int i = 1; i <= Math.max(1, car.getTotalFleetQuantity()); i++) {
                String reg = String.format("MH-02-RM-%04d", i * 111);
                vehicles.add(new IndividualVehicleDocument(
                        UUID.randomUUID().toString(),
                        reg,
                        "VIN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                        "Available",
                        12000L,
                        "Metallic"
                ));
            }
            car.setIndividualVehicles(vehicles);
        }
        car.setUpdatedAt(LocalDateTime.now());
        return inventoryRepository.save(car);
    }

    private CarAvailabilityDto computeAvailability(MongoCarInventoryDocument car, LocalDate reqStart, LocalDate reqEnd) {
        List<MongoBookingDocument> bookings = bookingRepository.findByVehicleIdAndStatusIn(car.getId(), ACTIVE_STATUSES);

        // Count bookings whose dates overlap with [reqStart, reqEnd]
        long overlappingCount = bookings.stream()
                .filter(b -> isOverlapping(b, reqStart, reqEnd))
                .count();

        int total = car.getTotalFleetQuantity();
        int maintenance = car.getMaintenanceQuantity();
        int booked = (int) overlappingCount;
        int available = Math.max(0, total - maintenance - booked);

        return new CarAvailabilityDto(
                car.getId(),
                car.getModelName(),
                car.getBrand(),
                car.getCategory(),
                car.getYear(),
                car.getRentalPricePerDay(),
                car.getImageUrl(),
                car.getTransmission(),
                car.getFuelType(),
                car.getSeatingCapacity(),
                total,
                maintenance,
                booked,
                available,
                reqStart.toString(),
                reqEnd.toString(),
                car.getIndividualVehicles()
        );
    }

    private boolean isOverlapping(MongoBookingDocument b, LocalDate reqStart, LocalDate reqEnd) {
        if (b.getPickupDate() == null || b.getDropoffDate() == null) return false;
        try {
            LocalDate bStart = LocalDate.parse(b.getPickupDate().substring(0, 10));
            LocalDate bEnd = LocalDate.parse(b.getDropoffDate().substring(0, 10));
            // Standard interval overlap: !bEnd.isBefore(reqStart) && !bStart.isAfter(reqEnd)
            return !bEnd.isBefore(reqStart) && !bStart.isAfter(reqEnd);
        } catch (Exception e) {
            return false;
        }
    }

    private LocalDate parseDateOrDefault(String dateStr, LocalDate defaultDate) {
        if (dateStr == null || dateStr.isBlank()) return defaultDate;
        try {
            return LocalDate.parse(dateStr.trim().substring(0, 10));
        } catch (DateTimeParseException e) {
            return defaultDate;
        }
    }

    /**
     * Seeds initial real-world inventory matching the existing fleet vehicles.
     */
    public List<MongoCarInventoryDocument> seedDefaultInventory() {
        List<MongoCarInventoryDocument> defaults = List.of(
                createModel("car-1", "Range Rover Velar", "Land Rover", "SUV", 2026, 219.0,
                        "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800", "Automatic", "Gasoline", 5, 5),
                createModel("car-2", "Porsche 911 Carrera S", "Porsche", "Coupe", 2026, 289.0,
                        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800", "Automatic", "Gasoline", 4, 5),
                createModel("car-3", "Tesla Model S Plaid", "Tesla", "Electric", 2026, 179.0,
                        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800", "Automatic", "Electric", 5, 8),
                createModel("car-4", "BMW M4 Competition", "BMW", "Coupe", 2026, 199.0,
                        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800", "Automatic", "Gasoline", 4, 4),
                createModel("car-5", "Mercedes-Benz S580", "Mercedes-Benz", "Sedan", 2026, 239.0,
                        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", "Automatic", "Hybrid", 5, 6),
                createModel("car-6", "Audi RS6 Avant", "Audi", "Sedan", 2026, 209.0,
                        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800", "Automatic", "Hybrid", 5, 4),
                createModel("car-7", "Genesis GV80 Prestige", "Genesis", "SUV", 2026, 169.0,
                        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800", "Automatic", "Gasoline", 7, 5),
                createModel("car-8", "Lucid Air Grand Touring", "Lucid", "Electric", 2026, 189.0,
                        "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800", "Automatic", "Electric", 5, 4)
        );

        List<MongoCarInventoryDocument> savedList = new ArrayList<>();
        for (MongoCarInventoryDocument doc : defaults) {
            if (!inventoryRepository.existsById(doc.getId())) {
                savedList.add(inventoryRepository.save(doc));
            } else {
                savedList.add(inventoryRepository.findById(doc.getId()).get());
            }
        }
        log.info("Initialized MongoDB car inventory with {} models.", savedList.size());
        return savedList;
    }

    private MongoCarInventoryDocument createModel(String id, String model, String brand, String category,
                                                  int year, double price, String img, String trans,
                                                  String fuel, int seats, int fleetQty) {
        MongoCarInventoryDocument doc = new MongoCarInventoryDocument(
                id, model, brand, category, year, price, img, trans, fuel, seats, fleetQty
        );
        List<IndividualVehicleDocument> vehicles = new ArrayList<>();
        for (int i = 1; i <= fleetQty; i++) {
            vehicles.add(new IndividualVehicleDocument(
                    id + "-v" + i,
                    String.format("CA-%s-%02d", brand.substring(0, Math.min(3, brand.length())).toUpperCase(), i),
                    "VIN" + (brand.hashCode() + i * 1000),
                    "Available",
                    10000L + i * 2000L,
                    "Standard"
            ));
        }
        doc.setIndividualVehicles(vehicles);
        return doc;
    }
}
