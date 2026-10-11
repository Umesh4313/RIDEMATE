package io.ridemate.carrental.service;

import io.ridemate.carrental.entity.Car;
import io.ridemate.carrental.exception.*;
import io.ridemate.carrental.repository.CarRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
public class CarService {

    private static final Logger log = LoggerFactory.getLogger(CarService.class);

    private final CarRepository carRepository;

    public CarService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    public List<Car> getAllCars(String status, String category) {
        if (status != null && category != null) return carRepository.findByStatusAndCategory(status, category);
        if (status != null) return carRepository.findByStatus(status);
        if (category != null) return carRepository.findByCategory(category);
        return carRepository.findAll();
    }

    public Car getCarById(String id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car with ID '" + id + "' not found."));
    }

    @Transactional
    public Car createCar(Car car) {
        Car saved = carRepository.save(car);
        log.info("Car created: {} ({})", saved.getName(), saved.getId());
        return saved;
    }

    @Transactional
    public Car updateCar(String id, Map<String, Object> updates) {
        Car car = getCarById(id);
        updates.forEach((key, value) -> {
            switch (key) {
                case "name" -> car.setName((String) value);
                case "status" -> car.setStatus((String) value);
                case "rentalPricePerDay" -> car.setRentalPricePerDay(((Number) value).doubleValue());
                case "discount" -> car.setDiscount(((Number) value).doubleValue());
                case "description" -> car.setDescription((String) value);
                case "location" -> car.setLocation((String) value);
                case "color" -> car.setColor((String) value);
                case "mileage" -> car.setMileage(((Number) value).longValue());
            }
        });
        return carRepository.save(car);
    }

    @Transactional
    public void deleteCar(String id) {
        Car car = getCarById(id);
        carRepository.delete(car);
        log.info("Car deleted: {}", id);
    }

    public Map<String, Object> getStats() {
        List<Car> all = carRepository.findAll();
        long available = all.stream().filter(c -> "Available".equals(c.getStatus())).count();
        long rented = all.stream().filter(c -> "Rented".equals(c.getStatus())).count();
        long maintenance = all.stream().filter(c -> "Maintenance".equals(c.getStatus())).count();
        long unavailable = all.stream().filter(c -> "Unavailable".equals(c.getStatus())).count();
        double avgRate = all.stream().mapToDouble(Car::getRentalPricePerDay).average().orElse(0);
        double totalValue = all.stream().mapToDouble(Car::getPrice).sum();
        double utilization = all.isEmpty() ? 0 : (rented * 100.0 / all.size());
        return Map.of(
                "totalCars", all.size(),
                "availableCars", available,
                "rentedCars", rented,
                "maintenanceCars", maintenance,
                "unavailableCars", unavailable,
                "averageRentalRate", Math.round(avgRate * 100) / 100.0,
                "totalFleetValuation", totalValue,
                "utilizationRate", Math.round(utilization * 100) / 100.0
        );
    }
}
