import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  RefreshCw, 
  Edit3, 
  Wrench, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export interface CarAvailabilityItem {
  carId: string;
  modelName: string;
  brand: string;
  category: string;
  year: number;
  rentalPricePerDay: number;
  imageUrl: string;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  totalFleetQuantity: number;
  maintenanceQuantity: number;
  bookedForPeriod: number;
  availableQuantity: number;
  pickupDate: string;
  dropoffDate: string;
  available: boolean;
  individualVehicles?: Array<{
    id: string;
    registrationNumber: string;
    vin: string;
    status: string;
    mileage: number;
    color: string;
  }>;
}

const DEFAULT_INVENTORY: CarAvailabilityItem[] = [
  {
    carId: 'car-2',
    modelName: 'Porsche 911 Carrera S',
    brand: 'Porsche',
    category: 'Coupe',
    year: 2026,
    rentalPricePerDay: 289,
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    seatingCapacity: 4,
    totalFleetQuantity: 5,
    maintenanceQuantity: 0,
    bookedForPeriod: 1,
    availableQuantity: 4,
    pickupDate: '2026-10-24',
    dropoffDate: '2026-10-27',
    available: true,
  },
  {
    carId: 'car-3',
    modelName: 'Tesla Model S Plaid',
    brand: 'Tesla',
    category: 'Electric',
    year: 2026,
    rentalPricePerDay: 179,
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seatingCapacity: 5,
    totalFleetQuantity: 8,
    maintenanceQuantity: 1,
    bookedForPeriod: 2,
    availableQuantity: 5,
    pickupDate: '2026-10-24',
    dropoffDate: '2026-10-27',
    available: true,
  },
  {
    carId: 'car-1',
    modelName: 'Range Rover Velar',
    brand: 'Land Rover',
    category: 'SUV',
    year: 2026,
    rentalPricePerDay: 219,
    imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    seatingCapacity: 5,
    totalFleetQuantity: 5,
    maintenanceQuantity: 0,
    bookedForPeriod: 0,
    availableQuantity: 5,
    pickupDate: '2026-10-24',
    dropoffDate: '2026-10-27',
    available: true,
  },
  {
    carId: 'car-4',
    modelName: 'BMW M4 Competition',
    brand: 'BMW',
    category: 'Coupe',
    year: 2026,
    rentalPricePerDay: 199,
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    seatingCapacity: 4,
    totalFleetQuantity: 4,
    maintenanceQuantity: 0,
    bookedForPeriod: 1,
    availableQuantity: 3,
    pickupDate: '2026-10-24',
    dropoffDate: '2026-10-27',
    available: true,
  },
  {
    carId: 'car-5',
    modelName: 'Mercedes-Benz S580',
    brand: 'Mercedes-Benz',
    category: 'Sedan',
    year: 2026,
    rentalPricePerDay: 239,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seatingCapacity: 5,
    totalFleetQuantity: 6,
    maintenanceQuantity: 1,
    bookedForPeriod: 1,
    availableQuantity: 4,
    pickupDate: '2026-10-24',
    dropoffDate: '2026-10-27',
    available: true,
  },
  {
    carId: 'car-6',
    modelName: 'Audi RS6 Avant',
    brand: 'Audi',
    category: 'Sedan',
    year: 2026,
    rentalPricePerDay: 209,
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seatingCapacity: 5,
    totalFleetQuantity: 4,
    maintenanceQuantity: 0,
    bookedForPeriod: 0,
    availableQuantity: 4,
    pickupDate: '2026-10-24',
    dropoffDate: '2026-10-27',
    available: true,
  }
];

export const AdminInventoryTable: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const defaultDropoff = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState<string>(today);
  const [dropoffDate, setDropoffDate] = useState<string>(defaultDropoff);
  const [inventory, setInventory] = useState<CarAvailabilityItem[]>(DEFAULT_INVENTORY);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedCarId, setExpandedCarId] = useState<string | null>(null);

  // Edit Fleet Quantity Modal
  const [editingCar, setEditingCar] = useState<CarAvailabilityItem | null>(null);
  const [newFleetQty, setNewFleetQty] = useState<number>(5);
  const [updatingQty, setUpdatingQty] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      let res = await fetch(`/api/v1/inventory/availability?pickupDate=${pickupDate}&dropoffDate=${dropoffDate}`);
      if (!res.ok) {
        res = await fetch(`http://localhost:8085/api/v1/inventory/availability?pickupDate=${pickupDate}&dropoffDate=${dropoffDate}`);
      }
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setInventory(json.data);
        }
      }
    } catch {
      // Keep existing inventory or offline fallback
    } finally {
      setLoading(false);
    }
  }, [pickupDate, dropoffDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleOpenEditFleet = (item: CarAvailabilityItem) => {
    setEditingCar(item);
    setNewFleetQty(item.totalFleetQuantity);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleSaveFleetQty = async () => {
    if (!editingCar) return;
    setUpdatingQty(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      let res = await fetch(`/api/v1/inventory/${editingCar.carId}/fleet-quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newFleetQty })
      });
      if (!res.ok) {
        res = await fetch(`http://localhost:8085/api/v1/inventory/${editingCar.carId}/fleet-quantity`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newFleetQty })
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setUpdateSuccess(`Fleet quantity for ${editingCar.modelName} updated to ${newFleetQty}!`);
        // Refresh table
        fetchAvailability();
        setTimeout(() => {
          setEditingCar(null);
        }, 1200);
      } else {
        setUpdateError(json.message || 'Failed to update fleet quantity. May conflict with active bookings.');
      }
    } catch (err: any) {
      setUpdateError('Network error updating fleet quantity: ' + (err.message || 'Server unavailable'));
    } finally {
      setUpdatingQty(false);
    }
  };

  const handleToggleMaintenance = async (carId: string, regNumber: string, currentStatus: string) => {
    const nextMaint = currentStatus !== 'Maintenance';
    try {
      let res = await fetch(`/api/v1/inventory/${carId}/vehicle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: regNumber, inMaintenance: nextMaint })
      });
      if (!res.ok) {
        res = await fetch(`http://localhost:8085/api/v1/inventory/${carId}/vehicle-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationNumber: regNumber, inMaintenance: nextMaint })
        });
      }
      if (res.ok) {
        fetchAvailability();
      }
    } catch {
      // Toggle locally for demo feedback
      setInventory(prev => prev.map(c => {
        if (c.carId === carId && c.individualVehicles) {
          const updatedVehicles = c.individualVehicles.map(v => 
            v.registrationNumber === regNumber 
              ? { ...v, status: nextMaint ? 'Maintenance' : 'Available' } 
              : v
          );
          const newMaintCount = updatedVehicles.filter(v => v.status === 'Maintenance').length;
          const newAvail = Math.max(0, c.totalFleetQuantity - newMaintCount - c.bookedForPeriod);
          return {
            ...c,
            maintenanceQuantity: newMaintCount,
            availableQuantity: newAvail,
            individualVehicles: updatedVehicles
          };
        }
        return c;
      }));
    }
  };

  const totalAllFleet = inventory.reduce((acc, c) => acc + c.totalFleetQuantity, 0);
  const totalBooked = inventory.reduce((acc, c) => acc + c.bookedForPeriod, 0);
  const totalAvailable = inventory.reduce((acc, c) => acc + c.availableQuantity, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Rental Date Picker */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-[#f8faff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#0051d5] text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Fleet Quantity &amp; Date-Based Real-Time Availability
              </h2>
              <p className="text-xs text-slate-500">
                Backed by MongoDB <code className="text-xs text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">car_inventory</code> &amp; active reservation overlap math
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500 font-medium">Pickup:</span>
            <input 
              type="date"
              value={pickupDate}
              onChange={e => setPickupDate(e.target.value)}
              className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500 font-medium">Return:</span>
            <input 
              type="date"
              value={dropoffDate}
              onChange={e => setDropoffDate(e.target.value)}
              className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchAvailability}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
            title="Recalculate live availability"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aggregate Stats Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/60 text-center py-3 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px]">Total Fleet</span>
          <span className="text-base font-extrabold text-slate-900">{totalAllFleet} Units</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Booked for Selected Period</span>
          <span className="text-base font-extrabold text-blue-700">{totalBooked} Units</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Available to Rent</span>
          <span className="text-base font-extrabold text-emerald-700">{totalAvailable} Units</span>
        </div>
      </div>

      {/* Section 6 E: Official Admin Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/80 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Car Model</th>
              <th className="py-3.5 px-4 text-center">Total Fleet</th>
              <th className="py-3.5 px-4 text-center">In Maintenance</th>
              <th className="py-3.5 px-4 text-center">Booked for Period</th>
              <th className="py-3.5 px-4 text-center">Available</th>
              <th className="py-3.5 px-4 text-center">Rate / Day</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {inventory.map((item) => {
              const isExpanded = expandedCarId === item.carId;
              const hasUnits = item.availableQuantity > 0;

              return (
                <React.Fragment key={item.carId}>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    {/* Model Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.modelName} 
                          className="w-12 h-9 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100" 
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {item.modelName}
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.brand} &bull; {item.transmission} &bull; {item.seatingCapacity} Seats
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Fleet */}
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 font-extrabold text-sm">
                        {item.totalFleetQuantity}
                      </span>
                    </td>

                    {/* In Maintenance */}
                    <td className="py-3 px-4 text-center">
                      {item.maintenanceQuantity > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Wrench className="w-3 h-3 text-amber-600" />
                          <span>{item.maintenanceQuantity} Off-road</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0</span>
                      )}
                    </td>

                    {/* Booked for Selected Period */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.bookedForPeriod} Booked
                      </span>
                    </td>

                    {/* Available */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                        hasUnits 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                          : 'bg-rose-50 text-rose-700 border border-rose-300'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${hasUnits ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{item.availableQuantity} Available</span>
                      </span>
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-4 text-center font-semibold text-slate-800 text-xs">
                      {formatCurrency(item.rentalPricePerDay)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditFleet(item)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Update total fleet quantity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Fleet Qty</span>
                        </button>

                        <button
                          onClick={() => setExpandedCarId(isExpanded ? null : item.carId)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          title={isExpanded ? 'Hide individual vehicles' : 'View individual registered vehicles'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Individual Registered Vehicles Expander */}
                  {isExpanded && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={7} className="p-4 border-y border-slate-200">
                        <div className="max-w-4xl mx-auto space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-blue-600" />
                              <span>Individual Tracked Vehicles for {item.modelName}</span>
                            </span>
                            <span className="text-slate-500 font-normal">
                              Toggle individual unit maintenance to dynamically recalculate rentable inventory
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                            {(item.individualVehicles && item.individualVehicles.length > 0
                              ? item.individualVehicles
                              : Array.from({ length: item.totalFleetQuantity }, (_, i) => ({
                                  id: `${item.carId}-v${i + 1}`,
                                  registrationNumber: `MH-02-RM-${1000 + (item.brand.charCodeAt(0) * 11) + i * 20}`,
                                  vin: `VIN${Math.abs(item.carId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 5000) + i * 999}`,
                                  status: i < item.maintenanceQuantity ? 'Maintenance' : 'Available',
                                  mileage: 12000 + i * 2500,
                                  color: 'Standard Factory'
                                }))
                            ).map((veh) => {
                              const inMaint = veh.status === 'Maintenance';
                              return (
                                <div 
                                  key={veh.id} 
                                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                                    inMaint ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div>
                                    <div className="font-mono font-bold text-slate-900">{veh.registrationNumber}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{veh.vin}</div>
                                  </div>
                                  <button
                                    onClick={() => handleToggleMaintenance(item.carId, veh.registrationNumber, veh.status)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                      inMaint
                                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {inMaint ? 'In Service' : 'Send Service'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Fleet Quantity Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Edit Fleet Quantity</h3>
              </div>
              <button 
                onClick={() => setEditingCar(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 mb-3">
                Configure total physical units registered in fleet for <strong>{editingCar.modelName}</strong>.
              </p>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/80 text-xs text-blue-900 space-y-1 mb-4">
                <div className="flex justify-between font-semibold">
                  <span>Current Fleet:</span>
                  <span>{editingCar.totalFleetQuantity} Units</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Currently Booked for Selected Period:</span>
                  <span className="text-blue-700">{editingCar.bookedForPeriod} Active Reservation(s)</span>
                </div>
                <p className="text-[11px] text-blue-700 pt-1 border-t border-blue-200">
                  Note: Backend MongoDB rule prevents reducing fleet below active confirmed commitments.
                </p>
              </div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Total Fleet Quantity:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={newFleetQty}
                onChange={e => setNewFleetQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {updateError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            {updateSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{updateSuccess}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCar(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFleetQty}
                disabled={updatingQty}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {updatingQty ? 'Saving...' : 'Update Fleet Quantity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
