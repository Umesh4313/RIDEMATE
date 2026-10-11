package io.ridemate.carrental.mongodb;

import io.ridemate.carrental.mongodb.document.IndividualVehicleDocument;
import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import io.ridemate.carrental.mongodb.document.MongoCarInventoryDocument;
import io.ridemate.carrental.mongodb.dto.CarAvailabilityDto;
import io.ridemate.carrental.mongodb.repository.MongoBookingRepository;
import io.ridemate.carrental.mongodb.repository.MongoCarInventoryRepository;
import io.ridemate.carrental.mongodb.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventoryServiceTest {

    @Mock
    private MongoCarInventoryRepository inventoryRepository;

    @Mock
    private MongoBookingRepository bookingRepository;

    private InventoryService inventoryService;

    private MongoCarInventoryDocument porsche911;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryService(inventoryRepository, bookingRepository);

        porsche911 = new MongoCarInventoryDocument(
                "porsche-911",
                "Porsche 911 Carrera S",
                "Porsche",
                "Coupe",
                2026,
                289.0,
                "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800",
                "Automatic",
                "Gasoline",
                4,
                5
        );
        List<IndividualVehicleDocument> vehicles = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            vehicles.add(new IndividualVehicleDocument(
                    "porsche-v" + i,
                    "MH-02-RM-" + (100 + i),
                    "VINPOR" + (1000 + i),
                    "Available",
                    12000L,
                    "Guards Red"
            ));
        }
        porsche911.setIndividualVehicles(vehicles);
        porsche911.setMaintenanceQuantity(0);
    }

    @Test
    @DisplayName("Test 12: Five available Porsche 911 cars are initially displayed as 5")
    void testInitialAvailability() {
        when(inventoryRepository.findById("porsche-911")).thenReturn(Optional.of(porsche911));
        when(bookingRepository.findByVehicleIdAndStatusIn(eq("porsche-911"), anyList()))
                .thenReturn(Collections.emptyList());

        CarAvailabilityDto dto = inventoryService.getCarAvailability("porsche-911", "2026-10-24", "2026-10-27");

        assertNotNull(dto);
        assertEquals(5, dto.getTotalFleetQuantity());
        assertEquals(0, dto.getBookedForPeriod());
        assertEquals(5, dto.getAvailableQuantity());
        assertTrue(dto.isAvailable());
    }

    @Test
    @DisplayName("Test 13: After one overlapping booking, availability becomes 4")
    void testAvailabilityWithOverlappingBooking() {
        when(inventoryRepository.findById("porsche-911")).thenReturn(Optional.of(porsche911));

        MongoBookingDocument booking1 = new MongoBookingDocument();
        booking1.setId("bk-1");
        booking1.setVehicleId("porsche-911");
        booking1.setPickupDate("2026-10-24");
        booking1.setDropoffDate("2026-10-27");
        booking1.setStatus("Confirmed");

        when(bookingRepository.findByVehicleIdAndStatusIn(eq("porsche-911"), anyList()))
                .thenReturn(List.of(booking1));

        CarAvailabilityDto dto = inventoryService.getCarAvailability("porsche-911", "2026-10-24", "2026-10-27");

        assertEquals(5, dto.getTotalFleetQuantity());
        assertEquals(1, dto.getBookedForPeriod());
        assertEquals(4, dto.getAvailableQuantity());
    }

    @Test
    @DisplayName("Test 14: Non-overlapping bookings do not incorrectly reduce availability")
    void testNonOverlappingBookingsDoNotReduceAvailability() {
        when(inventoryRepository.findById("porsche-911")).thenReturn(Optional.of(porsche911));

        // Booking is for Nov 1 to Nov 5, requested is Oct 24 to Oct 27 (disjoint)
        MongoBookingDocument bookingNov = new MongoBookingDocument();
        bookingNov.setId("bk-nov");
        bookingNov.setVehicleId("porsche-911");
        bookingNov.setPickupDate("2026-11-01");
        bookingNov.setDropoffDate("2026-11-05");
        bookingNov.setStatus("Confirmed");

        when(bookingRepository.findByVehicleIdAndStatusIn(eq("porsche-911"), anyList()))
                .thenReturn(List.of(bookingNov));

        CarAvailabilityDto dto = inventoryService.getCarAvailability("porsche-911", "2026-10-24", "2026-10-27");

        assertEquals(5, dto.getTotalFleetQuantity());
        assertEquals(0, dto.getBookedForPeriod());
        assertEquals(5, dto.getAvailableQuantity());
    }

    @Test
    @DisplayName("Test 16: Maintenance vehicles are excluded from rentable inventory")
    void testMaintenanceVehicleExclusion() {
        porsche911.setMaintenanceQuantity(1);
        porsche911.getIndividualVehicles().get(0).setStatus("Maintenance");

        when(inventoryRepository.findById("porsche-911")).thenReturn(Optional.of(porsche911));
        when(bookingRepository.findByVehicleIdAndStatusIn(eq("porsche-911"), anyList()))
                .thenReturn(Collections.emptyList());

        CarAvailabilityDto dto = inventoryService.getCarAvailability("porsche-911", "2026-10-24", "2026-10-27");

        assertEquals(5, dto.getTotalFleetQuantity());
        assertEquals(1, dto.getMaintenanceQuantity());
        assertEquals(0, dto.getBookedForPeriod());
        assertEquals(4, dto.getAvailableQuantity()); // 5 total - 1 maintenance - 0 booked = 4
    }

    @Test
    @DisplayName("Test Admin fleet quantity cannot be reduced below active bookings")
    void testCannotReduceFleetBelowActiveBookings() {
        when(inventoryRepository.findById("porsche-911")).thenReturn(Optional.of(porsche911));

        MongoBookingDocument b1 = new MongoBookingDocument();
        b1.setStatus("Confirmed");
        MongoBookingDocument b2 = new MongoBookingDocument();
        b2.setStatus("Active");
        MongoBookingDocument b3 = new MongoBookingDocument();
        b3.setStatus("Confirmed");

        when(bookingRepository.findByVehicleIdAndStatusIn(eq("porsche-911"), anyList()))
                .thenReturn(List.of(b1, b2, b3)); // 3 active commitments

        // Trying to reduce fleet to 2 should throw IllegalArgumentException
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            inventoryService.updateFleetQuantity("porsche-911", 2);
        });

        assertTrue(ex.getMessage().contains("Cannot reduce fleet quantity to 2"));
    }

    @Test
    @DisplayName("Test Admin fleet quantity can be increased and synchronizes vehicles")
    void testIncreaseFleetQuantity() {
        when(inventoryRepository.findById("porsche-911")).thenReturn(Optional.of(porsche911));
        when(bookingRepository.findByVehicleIdAndStatusIn(eq("porsche-911"), anyList()))
                .thenReturn(Collections.emptyList());
        when(inventoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        MongoCarInventoryDocument updated = inventoryService.updateFleetQuantity("porsche-911", 8);

        assertEquals(8, updated.getTotalFleetQuantity());
        assertEquals(8, updated.getIndividualVehicles().size());
    }
}
