import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Percent, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Receipt,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { AdminAnalyticsData, MonthlyAnalyticsStat } from '../../types';
import { adminService } from '../../services/adminService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 12 }, (_, i) => 2024 + i); // 2024 through 2035 inclusive

export const AdminAnalytics: React.FC = () => {
  // Filters: defaults to October 2026 as per example scenario
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(10); // 1-12 or 'all'
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active chart view tab
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'profit' | 'bookings' | 'discounts-refunds' | 'taxes'>('revenue');

  // Tooltip hover state
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyAnalyticsStat | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const monthParam = selectedMonth === 'all' ? undefined : selectedMonth;
      const data = await adminService.getAnalytics(selectedYear, monthParam);
      setAnalytics(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch analytics from MongoDB');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedYear, selectedMonth]);

  const monthlyList = analytics?.monthlyStats || [];

  // Find max value across months for chart scaling
  const maxRevenue = Math.max(...monthlyList.map(m => m.grossRentalAmount), 100000);
  const maxProfit = Math.max(...monthlyList.map(m => Math.abs(m.netProfit)), 50000);
  const maxBookings = Math.max(...monthlyList.map(m => m.bookingsCount), 10);

  const formatCurrency = (amt: number) => {
    return '₹' + Math.round(amt).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Year/Month Filter Selectors */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Financial Performance & Revenue Recognition</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Profit & Financial Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated accounting metrics from MongoDB. GST is collected on behalf of tax authorities and is excluded from profit.
          </p>
        </div>

        {/* Independent Month & Year Dropdowns (Req 5) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Dropdown: January through December + All */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Month</label>
            <select
              id="analytics-month-select"
              value={selectedMonth}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMonth(val === 'all' ? 'all' : parseInt(val, 10));
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
            >
              <option value="all">Full Year (All 12 Months)</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown: 2024 through 2035 inclusive */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Year</label>
            <select
              id="analytics-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 lg:pt-0">
            <button
              onClick={loadAnalytics}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Zero Booking Warning Banner (Req 5 - Scenario C & D) */}
      {!isLoading && analytics && !analytics.hasBookingsForPeriod && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">
                {selectedMonth !== 'all'
                  ? `No bookings were recorded in ${MONTH_NAMES[(selectedMonth as number) - 1]} ${selectedYear}.`
                  : `No bookings were recorded in ${selectedYear}.`}
              </span>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                Financial records and monthly chart slots retain standard zero values without database distortion.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
            0 Records
          </span>
        </div>
      )}

      {/* Summary Cards Grid (Req 4) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Bookings */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bookings</span>
          <div className="text-xl font-black text-white">
            {isLoading ? '...' : analytics?.totalBookings || 0}
          </div>
          <div className="text-[10px] text-slate-500">
            {analytics?.completedRentals || 0} Completed • {analytics?.cancelledBookings || 0} Canceled
          </div>
        </div>

        {/* 2. Gross Rental Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Revenue</span>
          <div className="text-xl font-black text-white">
            {isLoading ? '...' : formatCurrency(analytics?.grossRentalAmount || 0)}
          </div>
          <div className="text-[10px] text-slate-500">Base catalog pricing</div>
        </div>

        {/* 3. Discounts Granted */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Discounts Granted</span>
          <div className="text-xl font-black text-amber-400">
            {isLoading ? '...' : formatCurrency(analytics?.discountsGranted || 0)}
          </div>
          <div className="text-[10px] text-slate-500">Coupons & promotions</div>
        </div>

        {/* 4. Revenue After Discount */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Rental Revenue</span>
          <div className="text-xl font-black text-emerald-400">
            {isLoading ? '...' : formatCurrency(analytics?.rentalRevenueAfterDiscounts || 0)}
          </div>
          <div className="text-[10px] text-slate-500">Taxable rental base</div>
        </div>

        {/* 5. GST Tax Collected */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">GST Collected</span>
          <div className="text-xl font-black text-blue-400">
            {isLoading ? '...' : formatCurrency(analytics?.gstCollected || 0)}
          </div>
          <div className="text-[10px] text-slate-500">Fiduciary duty (not profit)</div>
        </div>

        {/* 6. Net Profit (or Estimated Profit) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-800/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-300 block">
              {analytics?.isEstimatedProfit ? 'Estimated Profit' : 'Net Business Profit'}
            </span>
          </div>
          <div className="text-xl font-black text-white">
            {isLoading ? '...' : formatCurrency(analytics?.netProfit || 0)}
          </div>
          <div className="text-[10px] text-slate-400">
            Rev - Disc + Extras - Ref - Exp
          </div>
        </div>
      </div>

      {/* Secondary Financial Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex justify-between items-center">
          <span className="text-slate-400">Additional Charges Revenue:</span>
          <span className="font-bold text-white">{formatCurrency(analytics?.additionalChargeRevenue || 0)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex justify-between items-center">
          <span className="text-slate-400">Refunds Issued:</span>
          <span className="font-bold text-rose-400">{formatCurrency(analytics?.refundsIssued || 0)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex justify-between items-center">
          <span className="text-slate-400">Recorded Operating Costs:</span>
          <span className="font-bold text-slate-200">{formatCurrency(analytics?.operatingExpenses || 0)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex justify-between items-center">
          <span className="text-slate-400">Reporting Timezone:</span>
          <span className="font-bold text-blue-400">{analytics?.reportingTimezone || 'Asia/Kolkata (IST)'}</span>
        </div>
      </div>

      {/* Interactive Charts Section (Req 4 & Req 5) */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white font-serif">
              Monthly Trends — {selectedYear}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              12-Month reconciliation view. Hover over any bar to view exact figures.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'revenue', label: 'Revenue' },
              { id: 'profit', label: 'Net Profit' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'discounts-refunds', label: 'Discounts & Refunds' },
              { id: 'taxes', label: 'Tax Collected' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeChartTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hovered Month Detail Pill */}
        {hoveredMonth && (
          <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="font-bold text-white">{hoveredMonth.monthName} {selectedYear}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div>
                <span className="text-slate-400">Gross: </span>
                <span className="font-bold text-white">{formatCurrency(hoveredMonth.grossRentalAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400">Net Revenue: </span>
                <span className="font-bold text-emerald-400">{formatCurrency(hoveredMonth.rentalRevenueAfterDiscounts)}</span>
              </div>
              <div>
                <span className="text-slate-400">Profit: </span>
                <span className="font-bold text-blue-300">{formatCurrency(hoveredMonth.netProfit)}</span>
              </div>
              <div>
                <span className="text-slate-400">Bookings: </span>
                <span className="font-bold text-white">{hoveredMonth.bookingsCount}</span>
              </div>
              <div>
                <span className="text-slate-400">GST: </span>
                <span className="font-bold text-blue-400">{formatCurrency(hoveredMonth.gstCollected)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive SVG / Bar Graph */}
        <div className="h-64 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
          {monthlyList.map((m) => {
            let heightPct = 0;
            let displayVal = '₹0';
            let barColor = 'bg-blue-600';

            if (activeChartTab === 'revenue') {
              heightPct = maxRevenue > 0 ? (m.grossRentalAmount / maxRevenue) * 100 : 0;
              displayVal = formatCurrency(m.grossRentalAmount);
              barColor = 'bg-gradient-to-t from-blue-700 to-blue-500';
            } else if (activeChartTab === 'profit') {
              heightPct = maxProfit > 0 ? (Math.max(0, m.netProfit) / maxProfit) * 100 : 0;
              displayVal = formatCurrency(m.netProfit);
              barColor = 'bg-gradient-to-t from-emerald-700 to-emerald-500';
            } else if (activeChartTab === 'bookings') {
              heightPct = maxBookings > 0 ? (m.bookingsCount / maxBookings) * 100 : 0;
              displayVal = `${m.bookingsCount} bookings`;
              barColor = 'bg-gradient-to-t from-indigo-700 to-indigo-500';
            } else if (activeChartTab === 'discounts-refunds') {
              heightPct = maxRevenue > 0 ? ((m.discountsGranted + m.refunds) / maxRevenue) * 100 : 0;
              displayVal = formatCurrency(m.discountsGranted + m.refunds);
              barColor = 'bg-gradient-to-t from-amber-700 to-amber-500';
            } else if (activeChartTab === 'taxes') {
              heightPct = maxRevenue > 0 ? (m.gstCollected / (maxRevenue * 0.28)) * 100 : 0;
              displayVal = formatCurrency(m.gstCollected);
              barColor = 'bg-gradient-to-t from-cyan-700 to-cyan-500';
            }

            const clampedHeight = Math.min(100, Math.max(heightPct > 0 ? 8 : 2, heightPct));
            const isHighlighted = selectedMonth !== 'all' && selectedMonth === m.monthIndex;

            return (
              <div
                key={m.monthIndex}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredMonth(m)}
                onMouseLeave={() => setHoveredMonth(null)}
                onClick={() => setSelectedMonth(m.monthIndex)}
              >
                {/* Bar */}
                <div
                  className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 relative ${barColor} ${
                    isHighlighted ? 'ring-2 ring-white shadow-lg' : 'group-hover:brightness-125'
                  }`}
                  style={{ height: `${clampedHeight}%` }}
                >
                  {/* Tooltip on bar hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap pointer-events-none border border-slate-700 z-10">
                    {displayVal}
                  </div>
                </div>

                {/* Month Label */}
                <div className={`mt-2 text-[10px] font-bold tracking-tight text-center ${
                  isHighlighted ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {m.monthName.substring(0, 3)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reconciled Monthly Data Table (Req 5) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Bookings</th>
                <th className="py-2.5 px-3">Gross Revenue</th>
                <th className="py-2.5 px-3">Discounts</th>
                <th className="py-2.5 px-3">Net Rental Rev</th>
                <th className="py-2.5 px-3">GST Tax</th>
                <th className="py-2.5 px-3">Refunds</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {monthlyList.map((m) => (
                <tr
                  key={m.monthIndex}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    selectedMonth === m.monthIndex ? 'bg-blue-950/20' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-white">{m.monthName}</td>
                  <td className="py-2 px-3 text-slate-300">{m.bookingsCount}</td>
                  <td className="py-2 px-3 text-slate-200">{formatCurrency(m.grossRentalAmount)}</td>
                  <td className="py-2 px-3 text-amber-400">{formatCurrency(m.discountsGranted)}</td>
                  <td className="py-2 px-3 text-emerald-400">{formatCurrency(m.rentalRevenueAfterDiscounts)}</td>
                  <td className="py-2 px-3 text-blue-400">{formatCurrency(m.gstCollected)}</td>
                  <td className="py-2 px-3 text-rose-400">{formatCurrency(m.refunds)}</td>
                  <td className="py-2 px-3 text-right font-bold text-white">
                    {formatCurrency(m.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
