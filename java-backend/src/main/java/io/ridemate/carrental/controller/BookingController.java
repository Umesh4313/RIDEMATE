package io.ridemate.carrental.controller;

import io.ridemate.carrental.dto.*;
import io.ridemate.carrental.entity.Booking;
import io.ridemate.carrental.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/bookings", "/api/bookings"})
public class BookingController {

    private final BookingService bookingService;
    private final VoucherService voucherService;

    public BookingController(BookingService bookingService, VoucherService voucherService) {
        this.bookingService = bookingService;
        this.voucherService = voucherService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Fill in customer info from authenticated user if not provided
        if (userDetails != null) {
            if (req.getCustomerEmail() == null || req.getCustomerEmail().isBlank()) {
                req.setCustomerEmail(userDetails.getUsername());
            }
        }
        BookingResponse booking = bookingService.createBooking(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(booking, "Reservation confirmed successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerEmail,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Customers can only see their own bookings
        String filterEmail = customerEmail;
        if (userDetails != null && !hasAdminRole(userDetails)) {
            filterEmail = userDetails.getUsername();
        }
        List<BookingResponse> bookings = bookingService.getBookings(status, filterEmail);
        return ResponseEntity.ok(ApiResponse.success(bookings, null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id), null));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String requesterEmail = userDetails != null && !hasAdminRole(userDetails) ? userDetails.getUsername() : null;
        BookingResponse result = bookingService.cancelBooking(id, requesterEmail);
        return ResponseEntity.ok(ApiResponse.success(result, "Reservation cancelled successfully."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateStatusRequest req) {
        BookingResponse result = bookingService.updateBookingStatus(id, req.getStatus());
        return ResponseEntity.ok(ApiResponse.success(result, "Booking status updated to " + req.getStatus()));
    }

    // ===== VOUCHER DOWNLOAD / PRINT =====
    @GetMapping("/{id}/voucher")
    public ResponseEntity<byte[]> downloadVoucher(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "false") boolean inline) {
        Booking booking = bookingService.getBookingEntityById(id);
        byte[] pdf = voucherService.generateVoucherPdf(booking);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String dispositionType = inline ? "inline" : "attachment";
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                dispositionType + "; filename=\"ridemate-voucher-" + booking.getPickupCode() + ".pdf\"");
        headers.setContentLength(pdf.length);

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @PostMapping("/voucher/generate")
    public ResponseEntity<byte[]> generateVoucherDirect(
            @RequestBody Booking booking,
            @RequestParam(required = false, defaultValue = "false") boolean inline) {
        if (booking.getPickupCode() == null || booking.getPickupCode().isBlank()) {
            booking.setPickupCode("RM-" + (int)(Math.random() * 9000 + 1000));
        }
        byte[] pdf = voucherService.generateVoucherPdf(booking);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String dispositionType = inline ? "inline" : "attachment";
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                dispositionType + "; filename=\"ridemate-voucher-" + booking.getPickupCode() + ".pdf\"");
        headers.setContentLength(pdf.length);

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    private boolean hasAdminRole(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                               a.getAuthority().equals("ROLE_OPERATIONS"));
    }
}
