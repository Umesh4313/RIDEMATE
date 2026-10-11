package io.ridemate.carrental.mongodb.dto;

import io.ridemate.carrental.mongodb.document.IndividualVehicleDocument;
import java.util.List;

public class CarAvailabilityDto {
    private String carId;
    private String modelName;
    private String brand;
    private String category;
    private int year;
    private double rentalPricePerDay;
    private String imageUrl;
    private String transmission;
    private String fuelType;
    private int seatingCapacity;

    private int totalFleetQuantity;
    private int maintenanceQuantity;
    private int bookedForPeriod;
    private int availableQuantity;
    private boolean isAvailable;

    private String pickupDate;
    private String dropoffDate;
    private List<IndividualVehicleDocument> individualVehicles;

    public CarAvailabilityDto() {}

    public CarAvailabilityDto(String carId, String modelName, String brand, String category, int year,
                              double rentalPricePerDay, String imageUrl, String transmission, String fuelType,
                              int seatingCapacity, int totalFleetQuantity, int maintenanceQuantity,
                              int bookedForPeriod, int availableQuantity, String pickupDate, String dropoffDate,
                              List<IndividualVehicleDocument> individualVehicles) {
        this.carId = carId;
        this.modelName = modelName;
        this.brand = brand;
        this.category = category;
        this.year = year;
        this.rentalPricePerDay = rentalPricePerDay;
        this.imageUrl = imageUrl;
        this.transmission = transmission;
        this.fuelType = fuelType;
        this.seatingCapacity = seatingCapacity;
        this.totalFleetQuantity = totalFleetQuantity;
        this.maintenanceQuantity = maintenanceQuantity;
        this.bookedForPeriod = bookedForPeriod;
        this.availableQuantity = availableQuantity;
        this.isAvailable = availableQuantity > 0;
        this.pickupDate = pickupDate;
        this.dropoffDate = dropoffDate;
        this.individualVehicles = individualVehicles;
    }

    public String getCarId() { return carId; }
    public void setCarId(String carId) { this.carId = carId; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public double getRentalPricePerDay() { return rentalPricePerDay; }
    public void setRentalPricePerDay(double rentalPricePerDay) { this.rentalPricePerDay = rentalPricePerDay; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public int getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(int seatingCapacity) { this.seatingCapacity = seatingCapacity; }

    public int getTotalFleetQuantity() { return totalFleetQuantity; }
    public void setTotalFleetQuantity(int totalFleetQuantity) { this.totalFleetQuantity = totalFleetQuantity; }

    public int getMaintenanceQuantity() { return maintenanceQuantity; }
    public void setMaintenanceQuantity(int maintenanceQuantity) { this.maintenanceQuantity = maintenanceQuantity; }

    public int getBookedForPeriod() { return bookedForPeriod; }
    public void setBookedForPeriod(int bookedForPeriod) { this.bookedForPeriod = bookedForPeriod; }

    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) {
        this.availableQuantity = availableQuantity;
        this.isAvailable = availableQuantity > 0;
    }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public String getPickupDate() { return pickupDate; }
    public void setPickupDate(String pickupDate) { this.pickupDate = pickupDate; }

    public String getDropoffDate() { return dropoffDate; }
    public void setDropoffDate(String dropoffDate) { this.dropoffDate = dropoffDate; }

    public List<IndividualVehicleDocument> getIndividualVehicles() { return individualVehicles; }
    public void setIndividualVehicles(List<IndividualVehicleDocument> individualVehicles) { this.individualVehicles = individualVehicles; }
}
