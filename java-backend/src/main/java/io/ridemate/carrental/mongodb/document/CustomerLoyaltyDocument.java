package io.ridemate.carrental.mongodb.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "customer_loyalty")
public class CustomerLoyaltyDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String customerEmail;

    private String customerName;
    private String customerPhone;
    private int totalBookings;
    private double totalSpent;
    private String loyaltyTier; // "GUEST", "SILVER", "GOLD", "PLATINUM"
    private int loyaltyPoints;
    private String firstBookingDate;
    private String lastBookingDate;
    private List<String> usedCoupons = new ArrayList<>();
    private LocalDateTime updatedAt;

    public CustomerLoyaltyDocument() {
        this.totalBookings = 0;
        this.totalSpent = 0.0;
        this.loyaltyTier = "GUEST";
        this.loyaltyPoints = 0;
        this.updatedAt = LocalDateTime.now();
    }

    public CustomerLoyaltyDocument(String customerEmail, String customerName) {
        this();
        this.customerEmail = customerEmail;
        this.customerName = customerName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }

    public double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }

    public String getLoyaltyTier() { return loyaltyTier; }
    public void setLoyaltyTier(String loyaltyTier) { this.loyaltyTier = loyaltyTier; }

    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public String getFirstBookingDate() { return firstBookingDate; }
    public void setFirstBookingDate(String firstBookingDate) { this.firstBookingDate = firstBookingDate; }

    public String getLastBookingDate() { return lastBookingDate; }
    public void setLastBookingDate(String lastBookingDate) { this.lastBookingDate = lastBookingDate; }

    public List<String> getUsedCoupons() { return usedCoupons; }
    public void setUsedCoupons(List<String> usedCoupons) { this.usedCoupons = usedCoupons; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
