package io.ridemate.carrental.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cars")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(name = "model_year")
    private int year;

    @Column(unique = true)
    private String registrationNumber;

    private String vin;

    private String category;   // Sedan, SUV, Luxury, Electric, Coupe, Sports, Convertible, Truck
    private String fuelType;   // Gas, Hybrid, Electric, Diesel
    private String transmission; // Automatic, Manual
    private int seatingCapacity;
    private String color;
    private long mileage;
    private double price;

    @Column(nullable = false)
    private double rentalPricePerDay;

    private double discount;

    @Column(nullable = false)
    private String status; // Available, Rented, Maintenance, Unavailable

    @Column(columnDefinition = "TEXT")
    private String imagesJson; // JSON array of image URLs

    @Column(nullable = false)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;
    private int luggageBags;
    private String mpgOrRange;
    private double rating;
    private int reviewsCount;

    // Specs stored as JSON
    @Column(columnDefinition = "TEXT")
    private String specsJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Car() {
    }

    public Car(String id, String name, String brand, String model, int year, String registrationNumber,
               String vin, String category, String fuelType, String transmission, int seatingCapacity,
               String color, long mileage, double price, double rentalPricePerDay, double discount,
               String status, String imagesJson, String imageUrl, String description, String location,
               int luggageBags, String mpgOrRange, double rating, int reviewsCount, String specsJson,
               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.registrationNumber = registrationNumber;
        this.vin = vin;
        this.category = category;
        this.fuelType = fuelType;
        this.transmission = transmission;
        this.seatingCapacity = seatingCapacity;
        this.color = color;
        this.mileage = mileage;
        this.price = price;
        this.rentalPricePerDay = rentalPricePerDay;
        this.discount = discount;
        this.status = status;
        this.imagesJson = imagesJson;
        this.imageUrl = imageUrl;
        this.description = description;
        this.location = location;
        this.luggageBags = luggageBags;
        this.mpgOrRange = mpgOrRange;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.specsJson = specsJson;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "Available";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public int getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(int seatingCapacity) { this.seatingCapacity = seatingCapacity; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public long getMileage() { return mileage; }
    public void setMileage(long mileage) { this.mileage = mileage; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getRentalPricePerDay() { return rentalPricePerDay; }
    public void setRentalPricePerDay(double rentalPricePerDay) { this.rentalPricePerDay = rentalPricePerDay; }

    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImagesJson() { return imagesJson; }
    public void setImagesJson(String imagesJson) { this.imagesJson = imagesJson; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getLuggageBags() { return luggageBags; }
    public void setLuggageBags(int luggageBags) { this.luggageBags = luggageBags; }

    public String getMpgOrRange() { return mpgOrRange; }
    public void setMpgOrRange(String mpgOrRange) { this.mpgOrRange = mpgOrRange; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getSpecsJson() { return specsJson; }
    public void setSpecsJson(String specsJson) { this.specsJson = specsJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static CarBuilder builder() {
        return new CarBuilder();
    }

    public static class CarBuilder {
        private String id;
        private String name;
        private String brand;
        private String model;
        private int year;
        private String registrationNumber;
        private String vin;
        private String category;
        private String fuelType;
        private String transmission;
        private int seatingCapacity;
        private String color;
        private long mileage;
        private double price;
        private double rentalPricePerDay;
        private double discount;
        private String status;
        private String imagesJson;
        private String imageUrl;
        private String description;
        private String location;
        private int luggageBags;
        private String mpgOrRange;
        private double rating;
        private int reviewsCount;
        private String specsJson;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public CarBuilder id(String id) { this.id = id; return this; }
        public CarBuilder name(String name) { this.name = name; return this; }
        public CarBuilder brand(String brand) { this.brand = brand; return this; }
        public CarBuilder model(String model) { this.model = model; return this; }
        public CarBuilder year(int year) { this.year = year; return this; }
        public CarBuilder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public CarBuilder vin(String vin) { this.vin = vin; return this; }
        public CarBuilder category(String category) { this.category = category; return this; }
        public CarBuilder fuelType(String fuelType) { this.fuelType = fuelType; return this; }
        public CarBuilder transmission(String transmission) { this.transmission = transmission; return this; }
        public CarBuilder seatingCapacity(int seatingCapacity) { this.seatingCapacity = seatingCapacity; return this; }
        public CarBuilder color(String color) { this.color = color; return this; }
        public CarBuilder mileage(long mileage) { this.mileage = mileage; return this; }
        public CarBuilder price(double price) { this.price = price; return this; }
        public CarBuilder rentalPricePerDay(double rentalPricePerDay) { this.rentalPricePerDay = rentalPricePerDay; return this; }
        public CarBuilder discount(double discount) { this.discount = discount; return this; }
        public CarBuilder status(String status) { this.status = status; return this; }
        public CarBuilder imagesJson(String imagesJson) { this.imagesJson = imagesJson; return this; }
        public CarBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public CarBuilder description(String description) { this.description = description; return this; }
        public CarBuilder location(String location) { this.location = location; return this; }
        public CarBuilder luggageBags(int luggageBags) { this.luggageBags = luggageBags; return this; }
        public CarBuilder mpgOrRange(String mpgOrRange) { this.mpgOrRange = mpgOrRange; return this; }
        public CarBuilder rating(double rating) { this.rating = rating; return this; }
        public CarBuilder reviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; return this; }
        public CarBuilder specsJson(String specsJson) { this.specsJson = specsJson; return this; }
        public CarBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CarBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Car build() {
            return new Car(id, name, brand, model, year, registrationNumber, vin, category, fuelType,
                    transmission, seatingCapacity, color, mileage, price, rentalPricePerDay, discount,
                    status, imagesJson, imageUrl, description, location, luggageBags, mpgOrRange,
                    rating, reviewsCount, specsJson, createdAt, updatedAt);
        }
    }
}
