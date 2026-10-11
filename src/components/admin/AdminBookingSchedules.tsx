import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Car, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ChevronRight, 
  RefreshCw,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { adminService } from '../../services/adminService';

interface AdminBookingSchedulesProps {
  onInspectBooking?: (bookingRef: string) => void;
}

export const AdminBookingSchedules: React.FC<AdminBookingSchedulesProps> = ({
  onInspectBooking
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getVouchers('');
      setBookings(data || []);
    } catch (e) {
      console.error('Error fetching schedules:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const todayStr = '2026-10-24'; // Context date

  // Check if booking is overdue (return date < today and status is Active)
  const isBookingOverdue = (b: any) => {
    const isPast = b.endDate && b.endDate < todayStr;
    const isActive = b.voucherStatus?.toLowerCase() === 'active';
    return isPast && isActive;
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      b.customerName?.toLowerCase().includes(q) ||
      b.carModel?.toLowerCase().includes(q) ||
      b.bookingReference?.toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'OVERDUE') {
      matchesStatus = isBookingOverdue(b);
    } else if (statusFilter !== 'ALL') {
      matchesStatus = b.voucherStatus?.toUpperCase() === statusFilter.toUpperCase();
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Rental Chronology & Fleet Timelines</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Booking History & Rental Schedules</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual rental schedule across fleet models. Identifies overlapping reservations, active rentals, and overdue returns.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Schedule Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chronological List
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schedule by customer (Priya Sharma), vehicle (Porsche 911), or ref..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active (On Road)</option>
            <option value="OVERDUE">Overdue Returns</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={loadSchedules}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* View Mode 1: Timeline & Schedule Grid */}
      {viewMode === 'timeline' ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fleet Scheduling View — October 2026
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Confirmed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Overdue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Completed
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredBookings.map((b) => {
              const overdue = isBookingOverdue(b);
              const status = overdue ? 'Overdue' : (b.voucherStatus || 'Confirmed');

              return (
                <div
                  key={b.bookingReference}
                  className={`p-4 rounded-xl border transition-all ${
                    overdue
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-950/80 border-slate-850 hover:border-slate-750'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{b.customerName}</span>
                          <span className="font-mono text-[11px] text-blue-400 font-bold">{b.bookingReference}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {b.carModel} • {b.category || 'Luxury'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Dates */}
                      <div className="text-right text-xs">
                        <div className="text-slate-300 font-semibold">{b.startDate} → {b.endDate}</div>
                        <div className="text-[10px] text-slate-500">Total: ₹{Math.round(b.totalPayableAmount || 0).toLocaleString('en-IN')}</div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                          overdue
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                            : status.toLowerCase() === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : status.toLowerCase() === 'completed'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode 2: Chronological Table */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Pickup</th>
                <th className="py-3 px-4">Return</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredBookings.map((b) => {
                const overdue = isBookingOverdue(b);
                const status = overdue ? 'Overdue' : (b.voucherStatus || 'Confirmed');

                return (
                  <tr key={b.bookingReference} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{b.customerName}</td>
                    <td className="py-3 px-4 text-slate-300">{b.carModel}</td>
                    <td className="py-3 px-4 text-slate-400">{b.startDate}</td>
                    <td className="py-3 px-4 text-slate-400">{b.endDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{b.bookingReference}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        overdue
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
