package io.ridemate.carrental.mongodb.document;

public class IndividualVehicleDocument {
    private String id;
    private String registrationNumber;
    private String vin;
    private String status; // Available, Rented, Maintenance, Unavailable
    private long mileage;
    private String color;
    private String currentBookingId;

    public IndividualVehicleDocument() {
        this.status = "Available";
    }

    public IndividualVehicleDocument(String id, String registrationNumber, String vin, String status, long mileage, String color) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.vin = vin;
        this.status = status != null ? status : "Available";
        this.mileage = mileage;
        this.color = color;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getMileage() { return mileage; }
    public void setMileage(long mileage) { this.mileage = mileage; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getCurrentBookingId() { return currentBookingId; }
    public void setCurrentBookingId(String currentBookingId) { this.currentBookingId = currentBookingId; }
}
