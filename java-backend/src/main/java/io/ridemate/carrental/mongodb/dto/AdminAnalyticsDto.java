package io.ridemate.carrental.mongodb.dto;

import java.util.List;

public class AdminAnalyticsDto {

    private int selectedYear;
    private Integer selectedMonth; // null or 1-12
    private String selectedMonthName; // "All Months", "January", etc.
    private boolean hasBookings;
    private String message;

    // Summary Cards
    private long totalBookings;
    private long completedRentals;
    private long canceledBookings;
    private long activeRentals;

    private double grossRentalRevenue;
    private double discountsGranted;
    private double rentalRevenueAfterDiscounts;
    private double taxCollected;
    private double additionalChargeRevenue;
    private double refunds;
    private double operatingExpenses;
    private double netProfit;
    private String profitLabel; // "Estimated Profit" or "Net Profit"

    // 12-Month Chart Series
    private List<MonthlyFinancialPoint> monthlyData;

    public AdminAnalyticsDto() {}

    public static class MonthlyFinancialPoint {
        private String monthName;
        private String monthShort;
        private int monthIndex;
        private double grossRevenue;
        private double revenueAfterDiscount;
        private double netProfit;
        private long bookingCount;
        private double discounts;
        private double taxCollected;
        private double refunds;
        private double expenses;

        public MonthlyFinancialPoint() {}
        public MonthlyFinancialPoint(String monthName, String monthShort, int monthIndex,
                                     double grossRevenue, double revenueAfterDiscount,
                                     double netProfit, long bookingCount, double discounts,
                                     double taxCollected, double refunds, double expenses) {
            this.monthName = monthName;
            this.monthShort = monthShort;
            this.monthIndex = monthIndex;
            this.grossRevenue = grossRevenue;
            this.revenueAfterDiscount = revenueAfterDiscount;
            this.netProfit = netProfit;
            this.bookingCount = bookingCount;
            this.discounts = discounts;
            this.taxCollected = taxCollected;
            this.refunds = refunds;
            this.expenses = expenses;
        }

        public String getMonthName() { return monthName; }
        public void setMonthName(String monthName) { this.monthName = monthName; }
        public String getMonthShort() { return monthShort; }
        public void setMonthShort(String monthShort) { this.monthShort = monthShort; }
        public int getMonthIndex() { return monthIndex; }
        public void setMonthIndex(int monthIndex) { this.monthIndex = monthIndex; }
        public double getGrossRevenue() { return grossRevenue; }
        public void setGrossRevenue(double grossRevenue) { this.grossRevenue = grossRevenue; }
        public double getRevenueAfterDiscount() { return revenueAfterDiscount; }
        public void setRevenueAfterDiscount(double revenueAfterDiscount) { this.revenueAfterDiscount = revenueAfterDiscount; }
        public double getNetProfit() { return netProfit; }
        public void setNetProfit(double netProfit) { this.netProfit = netProfit; }
        public long getBookingCount() { return bookingCount; }
        public void setBookingCount(long bookingCount) { this.bookingCount = bookingCount; }
        public double getDiscounts() { return discounts; }
        public void setDiscounts(double discounts) { this.discounts = discounts; }
        public double getTaxCollected() { return taxCollected; }
        public void setTaxCollected(double taxCollected) { this.taxCollected = taxCollected; }
        public double getRefunds() { return refunds; }
        public void setRefunds(double refunds) { this.refunds = refunds; }
        public double getExpenses() { return expenses; }
        public void setExpenses(double expenses) { this.expenses = expenses; }
    }

    public int getSelectedYear() { return selectedYear; }
    public void setSelectedYear(int selectedYear) { this.selectedYear = selectedYear; }
    public Integer getSelectedMonth() { return selectedMonth; }
    public void setSelectedMonth(Integer selectedMonth) { this.selectedMonth = selectedMonth; }
    public String getSelectedMonthName() { return selectedMonthName; }
    public void setSelectedMonthName(String selectedMonthName) { this.selectedMonthName = selectedMonthName; }
    public boolean isHasBookings() { return hasBookings; }
    public void setHasBookings(boolean hasBookings) { this.hasBookings = hasBookings; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getCompletedRentals() { return completedRentals; }
    public void setCompletedRentals(long completedRentals) { this.completedRentals = completedRentals; }
    public long getCanceledBookings() { return canceledBookings; }
    public void setCanceledBookings(long canceledBookings) { this.canceledBookings = canceledBookings; }
    public long getActiveRentals() { return activeRentals; }
    public void setActiveRentals(long activeRentals) { this.activeRentals = activeRentals; }
    public double getGrossRentalRevenue() { return grossRentalRevenue; }
    public void setGrossRentalRevenue(double grossRentalRevenue) { this.grossRentalRevenue = grossRentalRevenue; }
    public double getDiscountsGranted() { return discountsGranted; }
    public void setDiscountsGranted(double discountsGranted) { this.discountsGranted = discountsGranted; }
    public double getRentalRevenueAfterDiscounts() { return rentalRevenueAfterDiscounts; }
    public void setRentalRevenueAfterDiscounts(double rentalRevenueAfterDiscounts) { this.rentalRevenueAfterDiscounts = rentalRevenueAfterDiscounts; }
    public double getTaxCollected() { return taxCollected; }
    public void setTaxCollected(double taxCollected) { this.taxCollected = taxCollected; }
    public double getAdditionalChargeRevenue() { return additionalChargeRevenue; }
    public void setAdditionalChargeRevenue(double additionalChargeRevenue) { this.additionalChargeRevenue = additionalChargeRevenue; }
    public double getRefunds() { return refunds; }
    public void setRefunds(double refunds) { this.refunds = refunds; }
    public double getOperatingExpenses() { return operatingExpenses; }
    public void setOperatingExpenses(double operatingExpenses) { this.operatingExpenses = operatingExpenses; }
    public double getNetProfit() { return netProfit; }
    public void setNetProfit(double netProfit) { this.netProfit = netProfit; }
    public String getProfitLabel() { return profitLabel; }
    public void setProfitLabel(String profitLabel) { this.profitLabel = profitLabel; }
    public List<MonthlyFinancialPoint> getMonthlyData() { return monthlyData; }
    public void setMonthlyData(List<MonthlyFinancialPoint> monthlyData) { this.monthlyData = monthlyData; }
}
