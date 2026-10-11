package io.ridemate.carrental.mongodb.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "audit_logs")
public class RentalAuditLogDocument {

    @Id
    private String id;

    private String action; // e.g. "COUPON_VALIDATED", "COUPON_APPLIED", "BOOKING_CREATED", "LOYALTY_AWARDED"
    private String actor;  // Customer email or admin username
    private String details;
    private String metadata;
    private LocalDateTime timestamp;

    public RentalAuditLogDocument() {
        this.timestamp = LocalDateTime.now();
    }

    public RentalAuditLogDocument(String action, String actor, String details, String metadata) {
        this();
        this.action = action;
        this.actor = actor;
        this.details = details;
        this.metadata = metadata;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
