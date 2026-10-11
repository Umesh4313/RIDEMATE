package io.ridemate.carrental.service;

import com.itextpdf.kernel.colors.*;
import com.itextpdf.kernel.font.*;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.*;
import com.itextpdf.layout.borders.*;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import io.ridemate.carrental.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class VoucherService {

    private static final Logger log = LoggerFactory.getLogger(VoucherService.class);

    private static final DeviceRgb BRAND_DARK = new DeviceRgb(11, 28, 48);
    private static final DeviceRgb BRAND_BLUE = new DeviceRgb(0, 81, 213);
    private static final DeviceRgb LIGHT_BG = new DeviceRgb(239, 244, 255);
    private static final DeviceRgb GREEN = new DeviceRgb(22, 163, 74);
    private static final DeviceRgb GRAY_TEXT = new DeviceRgb(69, 70, 77);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(198, 198, 205);

    public byte[] generateVoucherPdf(Booking booking) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(36, 36, 36, 36);

            PdfFont boldFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);

            // ========== HEADER BANNER ==========
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{2, 1}))
                    .useAllAvailableWidth()
                    .setBackgroundColor(BRAND_DARK)
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(8));

            Cell logoCell = new Cell().setBorder(Border.NO_BORDER)
                    .setPadding(24);
            logoCell.add(new Paragraph("RIDEMATE")
                    .setFont(boldFont).setFontSize(28).setFontColor(ColorConstants.WHITE));
            logoCell.add(new Paragraph("Car Rental Service")
                    .setFont(regularFont).setFontSize(10).setFontColor(new DeviceRgb(190, 198, 224)));
            headerTable.addCell(logoCell);

            Cell statusCell = new Cell().setBorder(Border.NO_BORDER)
                    .setPadding(24).setTextAlignment(TextAlignment.RIGHT)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);
            statusCell.add(new Paragraph("BOOKING CONFIRMED")
                    .setFont(boldFont).setFontSize(11).setFontColor(GREEN));
            statusCell.add(new Paragraph("Pickup Code")
                    .setFont(regularFont).setFontSize(9).setFontColor(new DeviceRgb(190, 198, 224)));
            statusCell.add(new Paragraph(booking.getPickupCode())
                    .setFont(boldFont).setFontSize(22).setFontColor(ColorConstants.WHITE));
            headerTable.addCell(statusCell);
            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // ========== VEHICLE INFO ==========
            Table vehicleTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .useAllAvailableWidth()
                    .setBackgroundColor(LIGHT_BG)
                    .setBorder(new SolidBorder(BRAND_BLUE, 1))
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(6));

            Cell vhCell = new Cell().setBorder(Border.NO_BORDER).setPadding(16);
            vhCell.add(new Paragraph(booking.getVehicleName() != null ? booking.getVehicleName() : "N/A")
                    .setFont(boldFont).setFontSize(18).setFontColor(BRAND_DARK));
            vhCell.add(new Paragraph((booking.getVehicleBrand() != null ? booking.getVehicleBrand() : "") +
                    " | " + (booking.getVehicleCategory() != null ? booking.getVehicleCategory() : "") +
                    " | " + booking.getVehicleYear())
                    .setFont(regularFont).setFontSize(10).setFontColor(GRAY_TEXT));
            vehicleTable.addCell(vhCell);
            document.add(vehicleTable);
            document.add(new Paragraph("\n"));

            // ========== BOOKING DETAILS ==========
            Paragraph detailsHeader = new Paragraph("BOOKING DETAILS")
                    .setFont(boldFont).setFontSize(10).setFontColor(BRAND_BLUE)
                    .setMarginBottom(6);
            document.add(detailsHeader);

            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
                    .useAllAvailableWidth()
                    .setBorder(new SolidBorder(LIGHT_GRAY, 1))
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(6));

            addDetailCell(detailsTable, boldFont, regularFont, "PICKUP DATE", booking.getPickupDate());
            addDetailCell(detailsTable, boldFont, regularFont, "PICKUP TIME", booking.getPickupTime());
            addDetailCell(detailsTable, boldFont, regularFont, "RETURN DATE", booking.getDropoffDate());
            addDetailCell(detailsTable, boldFont, regularFont, "RETURN TIME", booking.getDropoffTime());
            addDetailCell(detailsTable, boldFont, regularFont, "DURATION", booking.getDays() + " Day(s)");
            addDetailCell(detailsTable, boldFont, regularFont, "PICKUP LOCATION", booking.getPickupLocation());
            addDetailCell(detailsTable, boldFont, regularFont, "RETURN LOCATION", booking.getDropoffLocation());
            addDetailCell(detailsTable, boldFont, regularFont, "PROTECTION PLAN", capitalize(booking.getProtectionPlan()));
            document.add(detailsTable);
            document.add(new Paragraph("\n"));

            // ========== CUSTOMER INFO ==========
            document.add(new Paragraph("CUSTOMER INFORMATION")
                    .setFont(boldFont).setFontSize(10).setFontColor(BRAND_BLUE).setMarginBottom(6));

            Table custTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth()
                    .setBorder(new SolidBorder(LIGHT_GRAY, 1))
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(6));
            addDetailCell(custTable, boldFont, regularFont, "FULL NAME", booking.getCustomerName());
            addDetailCell(custTable, boldFont, regularFont, "EMAIL", booking.getCustomerEmail());
            addDetailCell(custTable, boldFont, regularFont, "PHONE", booking.getCustomerPhone());
            addDetailCell(custTable, boldFont, regularFont, "DRIVER LICENSE", booking.getDriverLicenseNumber());
            document.add(custTable);
            document.add(new Paragraph("\n"));

            // ========== PAYMENT SUMMARY ==========
            document.add(new Paragraph("PAYMENT SUMMARY")
                    .setFont(boldFont).setFontSize(10).setFontColor(BRAND_BLUE).setMarginBottom(6));

            Table payTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                    .useAllAvailableWidth()
                    .setBorder(new SolidBorder(LIGHT_GRAY, 1))
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(6));

            String curr = "Rs. ";
            addPayRow(payTable, boldFont, regularFont,
                    "Base Rental (" + booking.getDays() + " days @ " + curr + String.format("%.2f", booking.getDailyRate()) + "/day)",
                    curr + String.format("%.2f", booking.getRentalRateTotal()), false);

            if (booking.getProtectionFee() > 0) {
                addPayRow(payTable, boldFont, regularFont,
                        capitalize(booking.getProtectionPlan()) + " Protection Plan",
                        curr + String.format("%.2f", booking.getProtectionFee()), false);
            }

            if (booking.getDiscountAmount() > 0) {
                String promoLabel = "Applied Coupon (" + 
                        (booking.getCouponCode() != null ? booking.getCouponCode() : "DISCOUNT") +
                        (booking.getDiscountPercent() > 0 ? " - " + (int)booking.getDiscountPercent() + "% OFF" : "") + ")";
                addPayRow(payTable, boldFont, regularFont, promoLabel,
                        "-" + curr + String.format("%.2f", booking.getDiscountAmount()), false);
            }

            double taxable = booking.getTaxableAmount() > 0 ? booking.getTaxableAmount() : Math.max(0.0, booking.getRentalRateTotal() - booking.getDiscountAmount() + booking.getProtectionFee());
            addPayRow(payTable, boldFont, regularFont, "Taxable Amount",
                    curr + String.format("%.2f", taxable), false);

            double gst = booking.getGstAmount() > 0 ? booking.getGstAmount() : booking.getTaxesAndFees();
            double cgst = Math.round((gst / 2.0) * 100.0) / 100.0;
            double sgst = Math.round((gst - cgst) * 100.0) / 100.0;
            addPayRow(payTable, boldFont, regularFont, "Central GST / CGST (2.5%)",
                    curr + String.format("%.2f", cgst), false);
            addPayRow(payTable, boldFont, regularFont, "State GST / SGST (2.5%)",
                    curr + String.format("%.2f", sgst), false);
            addPayRow(payTable, boldFont, regularFont, "Total GST (5.0%)",
                    curr + String.format("%.2f", gst), false);

            // Total row
            Cell totalLabelCell = new Cell().setBorder(Border.NO_BORDER)
                    .setBackgroundColor(BRAND_DARK).setPadding(10);
            totalLabelCell.add(new Paragraph("TOTAL RENTAL AMOUNT")
                    .setFont(boldFont).setFontSize(12).setFontColor(ColorConstants.WHITE));
            payTable.addCell(totalLabelCell);

            Cell totalAmtCell = new Cell().setBorder(Border.NO_BORDER)
                    .setBackgroundColor(BRAND_DARK).setPadding(10).setTextAlignment(TextAlignment.RIGHT);
            totalAmtCell.add(new Paragraph(curr + String.format("%.2f", booking.getTotalDue()))
                    .setFont(boldFont).setFontSize(14).setFontColor(new DeviceRgb(147, 197, 253)));
            payTable.addCell(totalAmtCell);

            addPayRow(payTable, boldFont, regularFont, "Amount Paid",
                    curr + String.format("%.2f", booking.getTotalDue()), false);
            addPayRow(payTable, boldFont, regularFont, "Outstanding Balance",
                    curr + "0.00", false);

            document.add(payTable);
            document.add(new Paragraph("\n"));

            // Payment method
            document.add(new Paragraph("Payment charged to card ending in " + booking.getPaymentMethodLast4())
                    .setFont(regularFont).setFontSize(9).setFontColor(GRAY_TEXT));
            document.add(new Paragraph("\n"));

            // ========== FOOTER ==========
            LineSeparator line = new LineSeparator(new SolidLine(0.5f));
            line.setStrokeColor(LIGHT_GRAY);
            document.add(line);
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Thank you for choosing RIDEMATE! Present this voucher at the pickup counter.")
                    .setFont(boldFont).setFontSize(9).setFontColor(BRAND_BLUE).setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Booking Reference: " + booking.getId() + " | Generated: " +
                    (booking.getCreatedAt() != null ? booking.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) : "N/A"))
                    .setFont(regularFont).setFontSize(8).setFontColor(GRAY_TEXT).setTextAlignment(TextAlignment.CENTER));

            document.close();
            log.info("Voucher PDF generated for booking: {}", booking.getPickupCode());
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate voucher PDF for booking: {}", booking.getId(), e);
            throw new RuntimeException("Failed to generate voucher: " + e.getMessage(), e);
        }
    }

    private void addDetailCell(Table table, PdfFont boldFont, PdfFont regularFont, String label, String value) {
        Cell cell = new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(LIGHT_GRAY, 0.5f))
                .setBorderRight(new SolidBorder(LIGHT_GRAY, 0.5f))
                .setPadding(10);
        cell.add(new Paragraph(label).setFont(boldFont).setFontSize(7).setFontColor(GRAY_TEXT));
        cell.add(new Paragraph(value != null ? value : "N/A").setFont(boldFont).setFontSize(10).setFontColor(BRAND_DARK));
        table.addCell(cell);
    }

    private void addPayRow(Table table, PdfFont boldFont, PdfFont regularFont, String label, String amount, boolean isTotal) {
        Color bg = isTotal ? BRAND_DARK : ColorConstants.WHITE;
        Color fg = isTotal ? ColorConstants.WHITE : BRAND_DARK;

        Cell labelCell = new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(LIGHT_GRAY, 0.5f))
                .setBackgroundColor(bg).setPadding(8);
        labelCell.add(new Paragraph(label).setFont(regularFont).setFontSize(9).setFontColor(fg));
        table.addCell(labelCell);

        Cell amtCell = new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(LIGHT_GRAY, 0.5f))
                .setBackgroundColor(bg).setPadding(8).setTextAlignment(TextAlignment.RIGHT);
        amtCell.add(new Paragraph(amount).setFont(boldFont).setFontSize(9).setFontColor(fg));
        table.addCell(amtCell);
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return "N/A";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
