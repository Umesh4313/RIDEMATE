package io.ridemate.carrental.mongodb.service;

import io.ridemate.carrental.mongodb.document.MongoBookingDocument;
import io.ridemate.carrental.mongodb.dto.AdminAnalyticsDto;
import io.ridemate.carrental.mongodb.repository.MongoBookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AdminAnalyticsService.class);
    private final MongoBookingRepository mongoBookingRepository;

    public AdminAnalyticsService(MongoBookingRepository mongoBookingRepository) {
        this.mongoBookingRepository = mongoBookingRepository;
    }

    public AdminAnalyticsDto getFinancialAnalytics(int year, Integer month) {
        List<MongoBookingDocument> allBookings = mongoBookingRepository.findAll();

        AdminAnalyticsDto dto = new AdminAnalyticsDto();
        dto.setSelectedYear(year);
        dto.setSelectedMonth(month);
        dto.setSelectedMonthName(month != null ? Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH) : "All Months");

        // Filter bookings by year
        List<MongoBookingDocument> yearBookings = allBookings.stream()
                .filter(b -> extractYear(b) == year)
                .collect(Collectors.toList());

        // 12-Month series for the requested year
        List<AdminAnalyticsDto.MonthlyFinancialPoint> monthlyPoints = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            final int monthIdx = m;
            Month monthEnum = Month.of(m);
            String mFull = monthEnum.getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            String mShort = monthEnum.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            List<MongoBookingDocument> mBookings = yearBookings.stream()
                    .filter(b -> extractMonth(b) == monthIdx)
                    .collect(Collectors.toList());

            double gross = mBookings.stream().mapToDouble(this::getGrossRental).sum();
            double discounts = mBookings.stream().mapToDouble(MongoBookingDocument::getDiscountAmount).sum();
            double afterDiscount = Math.max(0.0, gross - discounts);
            double tax = mBookings.stream().mapToDouble(MongoBookingDocument::getGstAmount).sum();
            double protFees = mBookings.stream().mapToDouble(MongoBookingDocument::getProtectionFee).sum();
            double refunds = mBookings.stream()
                    .filter(b -> "Cancelled".equalsIgnoreCase(b.getStatus()) || "REFUNDED".equalsIgnoreCase(b.getPaymentStatus()))
                    .mapToDouble(MongoBookingDocument::getTotalDue).sum();

            // Baseline fleet operational cost estimation (depreciation, insurance & cleaning ~30% of revenue)
            double expenses = Math.round((afterDiscount * 0.32) * 100.0) / 100.0;
            // Net profit = revenue after discount + additional charges - refunds - expenses
            double netProfit = Math.round((afterDiscount + protFees - refunds - expenses) * 100.0) / 100.0;

            monthlyPoints.add(new AdminAnalyticsDto.MonthlyFinancialPoint(
                    mFull, mShort, m,
                    round2(gross), round2(afterDiscount), round2(netProfit),
                    mBookings.size(), round2(discounts), round2(tax), round2(refunds), round2(expenses)
            ));
        }
        dto.setMonthlyData(monthlyPoints);

        // Filter to specific month if requested, otherwise aggregate full year
        List<MongoBookingDocument> activeFilterBookings = (month != null)
                ? yearBookings.stream().filter(b -> extractMonth(b) == month).collect(Collectors.toList())
                : yearBookings;

        boolean hasData = !activeFilterBookings.isEmpty();
        dto.setHasBookings(hasData);

        if (!hasData) {
            String periodName = (month != null)
                    ? Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + year
                    : String.valueOf(year);
            dto.setMessage("No bookings were recorded in " + periodName + ".");
            dto.setProfitLabel("Estimated Profit");
            return dto;
        }

        // Aggregate summary metrics
        long total = activeFilterBookings.size();
        long completed = activeFilterBookings.stream().filter(b -> "Completed".equalsIgnoreCase(b.getStatus())).count();
        long canceled = activeFilterBookings.stream().filter(b -> "Cancelled".equalsIgnoreCase(b.getStatus())).count();
        long active = activeFilterBookings.stream().filter(b -> "Confirmed".equalsIgnoreCase(b.getStatus()) || "Active".equalsIgnoreCase(b.getStatus())).count();

        double gross = activeFilterBookings.stream().mapToDouble(this::getGrossRental).sum();
        double discounts = activeFilterBookings.stream().mapToDouble(MongoBookingDocument::getDiscountAmount).sum();
        double afterDiscount = Math.max(0.0, gross - discounts);
        double tax = activeFilterBookings.stream().mapToDouble(MongoBookingDocument::getGstAmount).sum();
        double protFees = activeFilterBookings.stream().mapToDouble(MongoBookingDocument::getProtectionFee).sum();
        double refunds = activeFilterBookings.stream()
                .filter(b -> "Cancelled".equalsIgnoreCase(b.getStatus()) || "REFUNDED".equalsIgnoreCase(b.getPaymentStatus()))
                .mapToDouble(MongoBookingDocument::getTotalDue).sum();

        double expenses = Math.round((afterDiscount * 0.32) * 100.0) / 100.0;
        double netProfit = Math.round((afterDiscount + protFees - refunds - expenses) * 100.0) / 100.0;

        dto.setTotalBookings(total);
        dto.setCompletedRentals(completed);
        dto.setCanceledBookings(canceled);
        dto.setActiveRentals(active);
        dto.setGrossRentalRevenue(round2(gross));
        dto.setDiscountsGranted(round2(discounts));
        dto.setRentalRevenueAfterDiscounts(round2(afterDiscount));
        dto.setTaxCollected(round2(tax));
        dto.setAdditionalChargeRevenue(round2(protFees));
        dto.setRefunds(round2(refunds));
        dto.setOperatingExpenses(round2(expenses));
        dto.setNetProfit(round2(netProfit));
        dto.setProfitLabel("Estimated Profit");
        dto.setMessage(String.format("Showing %d booking(s) for %s.", total, dto.getSelectedMonthName()));

        return dto;
    }

    private int extractYear(MongoBookingDocument b) {
        if (b.getPickupDate() != null && b.getPickupDate().length() >= 4) {
            try { return Integer.parseInt(b.getPickupDate().substring(0, 4)); } catch (Exception ignored) {}
        }
        if (b.getCreatedAt() != null) return b.getCreatedAt().getYear();
        return LocalDate.now().getYear();
    }

    private int extractMonth(MongoBookingDocument b) {
        if (b.getPickupDate() != null && b.getPickupDate().length() >= 7) {
            try { return Integer.parseInt(b.getPickupDate().substring(5, 7)); } catch (Exception ignored) {}
        }
        if (b.getCreatedAt() != null) return b.getCreatedAt().getMonthValue();
        return LocalDate.now().getMonthValue();
    }

    private double getGrossRental(MongoBookingDocument b) {
        if (b.getBaseRentalPrice() > 0) return b.getBaseRentalPrice();
        if (b.getDailyRate() > 0 && b.getDays() > 0) return b.getDailyRate() * b.getDays();
        return b.getTotalDue();
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
