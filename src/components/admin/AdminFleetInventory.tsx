import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Calendar, 
  Car, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Edit3, 
  Plus, 
  Clock, 
  Info,
  ShieldCheck,
  X
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminFleetInventory: React.FC = () => {
  // Date range selectors (defaulting to 24-27 October 2026 as per user example)
  const [startDate, setStartDate] = useState<string>('2026-10-24');
  const [endDate, setEndDate] = useState<string>('2026-10-27');
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Fleet Quantity Edit Modal
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(6);
  const [editReason, setEditReason] = useState<string>('Fleet inventory adjustment');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getFleetInventory(startDate, endDate);
      setInventoryList(data || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [startDate, endDate]);

  const handleUpdateFleetQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsUpdating(true);
    try {
      const carIdentifier = editingItem.id || editingItem.carId || editingItem.carModel;
      await adminService.updateFleetQuantity(
        carIdentifier,
        newQuantity,
        editReason.trim() || 'Admin fleet adjustment'
      );
      setFeedbackMessage(`Fleet quantity for ${editingItem.carModel} updated to ${newQuantity}. Audit log recorded in MongoDB.`);
      setEditingItem(null);
      loadInventory();
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleMaintenance = async (item: any, unitIndex: number, currentStatus: boolean) => {
    try {
      const carIdentifier = item.id || item.carId || item.carModel;
      const regNumber = item.vehicles?.[unitIndex]?.registrationNumber || `VEH-${unitIndex + 1}`;
      await adminService.setVehicleMaintenance(
        carIdentifier,
        regNumber,
        !currentStatus,
        `Unit #${unitIndex + 1} (${regNumber}) maintenance toggled to ${!currentStatus}`
      );
      setFeedbackMessage(`Vehicle unit #${unitIndex + 1} status updated in MongoDB.`);
      loadInventory();
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Real-Time Fleet Allocations</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Fleet Inventory & Availability</h1>
          <p className="text-xs text-slate-400 mt-1">
            Date-specific reservations calculated directly against MongoDB active bookings. Cars are never permanently subtracted.
          </p>
        </div>

        {/* Date Filter Picker */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Pickup Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden font-bold"
            />
          </div>

          <span className="text-slate-600 font-bold pt-3">→</span>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Return Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden font-bold"
            />
          </div>

          <div className="pt-3">
            <button
              onClick={loadInventory}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              title="Refresh Availability"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Illustrative Porsche 911 Scenario Explainer Card (Req 3) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 space-y-1">
          <p>
            <strong className="text-white">Date-Specific Availability Rule:</strong> For any selected dates (e.g. 24–27 October),
            RIDEMATE checks active reservations overlapping that exact window. If 1 Porsche 911 is reserved out of a fleet of 6,
            5 remain available. An unrelated booking in November does not reduce October availability.
          </p>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventoryList.map((item) => {
          const isFullyBooked = item.availableUnits === 0;

          return (
            <div
              key={item.carModel}
              className={`bg-slate-900/90 rounded-2xl border p-5 space-y-4 transition-all ${
                isFullyBooked
                  ? 'border-rose-500/40 shadow-lg shadow-rose-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 block mb-0.5">
                    {item.category || 'Luxury'}
                  </span>
                  <h3 className="text-lg font-black text-white font-serif">{item.carModel}</h3>
                </div>

                <button
                  onClick={() => {
                    setEditingItem(item);
                    setNewQuantity(item.totalQuantity);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                  title="Adjust Fleet Quantity"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Metrics Pill Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Fleet</span>
                  <span className="text-sm font-extrabold text-white">{item.totalQuantity}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                  <span className="text-[9px] uppercase font-bold text-amber-500 block">Booked</span>
                  <span className="text-sm font-extrabold text-amber-400">{item.bookedUnits}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Maint.</span>
                  <span className="text-sm font-extrabold text-slate-300">{item.maintenanceUnits}</span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isFullyBooked
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  <span className="text-[9px] uppercase font-bold block">Available</span>
                  <span className="text-sm font-extrabold">{item.availableUnits}</span>
                </div>
              </div>

              {/* Status Message */}
              {isFullyBooked ? (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-bold text-center">
                  All units reserved for selected dates.
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Available for booking:</span>
                  <span className="font-bold text-emerald-400">{item.availableUnits} of {item.totalQuantity} cars</span>
                </div>
              )}

              {/* Individual Units Tracker Pill Row */}
              <div className="pt-2 border-t border-slate-850 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Fleet Unit Inspection</span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: item.totalQuantity }).map((_, idx) => {
                    const isMaint = idx < item.maintenanceUnits;
                    const isBooked = !isMaint && idx < (item.bookedUnits + item.maintenanceUnits);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleMaintenance(item, idx, isMaint)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                          isMaint
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : isBooked
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                        title={isMaint ? 'In Maintenance (click to release)' : isBooked ? 'Booked for period' : 'Available (click to service)'}
                      >
                        #{idx + 1} {isMaint ? 'Maint' : isBooked ? 'Booked' : 'Avail'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Fleet Quantity Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateFleetQuantity}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Adjust Fleet Size</h3>
                <p className="text-xs text-slate-400">{editingItem.carModel}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Fleet Quantity in System
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Audit Reason for Fleet Adjustment
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                placeholder="e.g. Additional vehicles procured / lease return"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Update & Log Audit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
