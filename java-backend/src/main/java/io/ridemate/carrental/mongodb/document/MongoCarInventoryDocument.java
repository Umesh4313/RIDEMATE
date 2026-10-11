package io.ridemate.carrental.mongodb.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "car_inventory")
public class MongoCarInventoryDocument {

    @Id
    private String id; // Matches car ID (e.g. car-1 or UUID)

    @Indexed
    private String modelName;

    @Indexed
    private String brand;

    private String category;
    private int year;
    private double rentalPricePerDay;
    private String imageUrl;
    private String transmission;
    private String fuelType;
    private int seatingCapacity;
    private String description;

    // Fleet Quantities
    private int totalFleetQuantity;
    private int maintenanceQuantity;

    // Tracked unique physical vehicles
    private List<IndividualVehicleDocument> individualVehicles = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MongoCarInventoryDocument() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public MongoCarInventoryDocument(String id, String modelName, String brand, String category, int year,
                                     double rentalPricePerDay, String imageUrl, String transmission,
                                     String fuelType, int seatingCapacity, int totalFleetQuantity) {
        this.id = id;
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
        this.maintenanceQuantity = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getTotalFleetQuantity() { return totalFleetQuantity; }
    public void setTotalFleetQuantity(int totalFleetQuantity) { this.totalFleetQuantity = totalFleetQuantity; }

    public int getMaintenanceQuantity() { return maintenanceQuantity; }
    public void setMaintenanceQuantity(int maintenanceQuantity) { this.maintenanceQuantity = maintenanceQuantity; }

    public List<IndividualVehicleDocument> getIndividualVehicles() { return individualVehicles; }
    public void setIndividualVehicles(List<IndividualVehicleDocument> individualVehicles) { this.individualVehicles = individualVehicles; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
