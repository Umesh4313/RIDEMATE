import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Save, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calculator, 
  Info,
  DollarSign,
  Percent
} from 'lucide-react';
import { PolicySettingsData } from '../../types';
import { adminService } from '../../services/adminService';

export const AdminPolicies: React.FC = () => {
  const [policies, setPolicies] = useState<PolicySettingsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('Periodic policy review and adjustment');

  // Calculator states for live simulation
  const [simRentalAmount, setSimRentalAmount] = useState<number>(10000);
  const [simHoursBeforePickup, setSimHoursBeforePickup] = useState<number>(48);
  const [simLateHours, setSimLateHours] = useState<number>(2);

  const fetchPolicies = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getPolicies();
      setPolicies(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load policy settings from MongoDB');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleTierPercentageChange = (index: number, newFeePct: number) => {
    if (!policies) return;
    const updatedTiers = [...policies.cancellationTiers];
    updatedTiers[index].feePercentage = newFeePct;
    setPolicies({ ...policies, cancellationTiers: updatedTiers });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policies) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    try {
      const updated = await adminService.updatePolicies(policies, reason.trim() || 'Admin cancellation policy revision');
      setPolicies(updated);
      setSaveSuccess('Cancellation policies and surcharges successfully committed to MongoDB.');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to persist policies');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute fee based on hours
  let activeTierFeePct = 0;
  if (policies?.cancellationTiers) {
    if (simHoursBeforePickup >= 72) {
      activeTierFeePct = policies.cancellationTiers[0]?.feePercentage ?? 0;
    } else if (simHoursBeforePickup >= 24) {
      activeTierFeePct = policies.cancellationTiers[1]?.feePercentage ?? 10;
    } else {
      activeTierFeePct = policies.cancellationTiers[2]?.feePercentage ?? 25;
    }
  }
  const calculatedFeeAmount = (simRentalAmount * activeTierFeePct) / 100;
  const calculatedRefundAmount = Math.max(0, simRentalAmount - calculatedFeeAmount);
  const calculatedLateFee = simLateHours * (policies?.lateReturnHourlyFee || 500);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Connecting to MongoDB & loading cancellation policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Policy Governance & Rental Terms</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Cancellation Policies & Additional Charges</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative cancellation deadlines, percentage deductions, late return penalties, and surcharges stored in MongoDB.
          </p>
        </div>

        <button
          onClick={fetchPolicies}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Policies</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Tiered Cancellation Deadlines & Fee Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved policies govern refund calculations. Once a booking is finalized, subsequent policy revisions will not retroactively alter its terms.
              </p>
            </div>

            {/* Tiers List */}
            <div className="space-y-4">
              {policies?.cancellationTiers?.map((tier, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white">{tier.tierName}</span>
                    <p className="text-[11px] text-slate-400">{tier.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold">Fee:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={tier.feePercentage}
                        onChange={(e) => handleTierPercentageChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-right font-extrabold text-white text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                      <span className="text-slate-400 font-bold text-xs">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Late Return and Surcharges Section */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Overtime & Operational Surcharges
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Late-Return Charge (₹ per hour)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={policies?.lateReturnHourlyFee || 500}
                      onChange={(e) => setPolicies({ ...policies!, lateReturnHourlyFee: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Applies after grace period</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Extra Rental Day Surcharge (₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={policies?.extraDaySurcharge || 1500}
                      onChange={(e) => setPolicies({ ...policies!, extraDaySurcharge: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Extended rental rate</p>
                </div>
              </div>
            </div>

            {/* Audit Justification & Save */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Audit Log Justification / Reason for Modification
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Revised cancellation fee structure per Q4 legal terms"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">Updated by: {policies?.updatedBy || 'admin'}</span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Saving...' : 'Save Policies to MongoDB'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Live Policy Simulation Tool (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Cancellation Fee Simulator</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify cancellation penalties matching the prompt example: ₹10,000 booking cancelled between 24 and 72 hours before pickup incurs a 10% fee (₹1,000).
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Qualifying Rental Amount (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={simRentalAmount}
                  onChange={(e) => setSimRentalAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Hours Before Pickup Window
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={simHoursBeforePickup}
                  onChange={(e) => setSimHoursBeforePickup(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {simHoursBeforePickup >= 72
                    ? 'Tier 1: >72 hours before pickup (0% fee)'
                    : simHoursBeforePickup >= 24
                    ? 'Tier 2: 24–72 hours before pickup (10% fee)'
                    : 'Tier 3: <24 hours before pickup (25% fee)'}
                </span>
              </div>

              {/* Simulation Result */}
              <div className="pt-3 border-t border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Eligible Rental:</span>
                  <span className="font-semibold text-white">₹{simRentalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-400 font-semibold">
                  <span>Cancellation Fee ({activeTierFeePct}%):</span>
                  <span>- ₹{calculatedFeeAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Customer Refund:</span>
                  <span className="text-emerald-400">₹{calculatedRefundAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Late Return Simulation */}
            <div className="pt-4 border-t border-slate-850 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Late Return Simulation</span>
              <div className="flex items-center justify-between text-slate-300">
                <span>Chargeable Late Hours:</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={simLateHours}
                  onChange={(e) => setSimLateHours(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                />
              </div>
              <div className="flex justify-between text-slate-300 pt-1">
                <span>Calculated Late Fee:</span>
                <span className="font-bold text-amber-400">₹{calculatedLateFee.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
