import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Calculator,
  Plus,
  Trash2,
  FileCheck
} from 'lucide-react';
import { TaxSettingsData, TaxCategoryItem } from '../../types';
import { adminService } from '../../services/adminService';

export const AdminTaxSettings: React.FC = () => {
  const [settings, setSettings] = useState<TaxSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState<string>('Periodic GST rate update');

  // Calculator preview states
  const [calcBaseAmount, setCalcBaseAmount] = useState<number>(6000);
  const [calcDiscountPercent, setCalcDiscountPercent] = useState<number>(10);

  const fetchTaxSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getTaxSettings();
      setSettings(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load tax settings from MongoDB');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxSettings();
  }, []);

  const handleGstRateChange = (percentage: number) => {
    if (!settings) return;
    const rateDecimal = percentage / 100;
    const half = rateDecimal / 2;
    setSettings({
      ...settings,
      gstRate: rateDecimal,
      cgstRate: half,
      sgstRate: half,
      igstRate: rateDecimal
    });
  };

  const handleToggleCategory = (index: number) => {
    if (!settings) return;
    const updatedCategories = [...settings.taxCategories];
    updatedCategories[index].enabled = !updatedCategories[index].enabled;
    setSettings({ ...settings, taxCategories: updatedCategories });
  };

  const handleCategoryRateChange = (index: number, newRate: number) => {
    if (!settings) return;
    const updatedCategories = [...settings.taxCategories];
    updatedCategories[index].rate = newRate;
    setSettings({ ...settings, taxCategories: updatedCategories });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    try {
      const updated = await adminService.updateTaxSettings(settings, changeReason.trim() || 'Admin tax setting update');
      setSettings(updated);
      setSaveSuccess('Tax configuration saved to MongoDB and effective immediately for all new bookings.');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to persist tax settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculator computations
  const currentGstPct = (settings?.gstRate || 0.05) * 100;
  const calcDiscountAmount = (calcBaseAmount * calcDiscountPercent) / 100;
  const calcTaxableAmount = Math.max(0, calcBaseAmount - calcDiscountAmount);
  const calcGstAmount = (calcTaxableAmount * currentGstPct) / 100;
  const calcTotalPayable = calcTaxableAmount + calcGstAmount;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Connecting to MongoDB & loading tax configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Percent className="w-4 h-4" />
            <span>Statutory Compliance & Taxation</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">GST & Tax Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure authoritative GST percentages and statutory categories. Historical bookings retain saved rates; new bookings adopt updated policies upon save.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTaxSettings}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload Config</span>
          </button>
        </div>
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Primary GST Rate Configuration</span>
              </h2>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
                MongoDB Active Doc: {settings?.id || 'active_tax_config'}
              </span>
            </div>

            {/* Quick GST Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Standard GST Rate (%)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[5, 8, 12, 18, 28].map((preset) => {
                  const isSelected = Math.round(currentGstPct) === preset;
                  return (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => handleGstRateChange(preset)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-750 hover:bg-slate-750 hover:text-white'
                      }`}
                    >
                      {preset}% GST
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={currentGstPct}
                  onChange={(e) => handleGstRateChange(parseFloat(e.target.value) || 0)}
                  className="w-36 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400">
                  Total statutory GST applied to rental and taxable components.
                </span>
              </div>
            </div>

            {/* Sub-Tax Split Breakdown (CGST, SGST, IGST) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-850">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">CGST (Central)</span>
                <span className="text-base font-extrabold text-white">
                  {((settings?.cgstRate || 0) * 100).toFixed(2)}%
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Intra-state split (50%)</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SGST (State)</span>
                <span className="text-base font-extrabold text-white">
                  {((settings?.sgstRate || 0) * 100).toFixed(2)}%
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Intra-state split (50%)</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">IGST (Inter-State)</span>
                <span className="text-base font-extrabold text-white">
                  {((settings?.igstRate || 0) * 100).toFixed(2)}%
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Full interstate rate</p>
              </div>
            </div>

            {/* Supported Tax Categories */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Applicable Tax Categories & Exemptions
                </label>
                <span className="text-[11px] text-slate-500">Toggle enabled status per line-item</span>
              </div>

              <div className="space-y-2">
                {settings?.taxCategories?.map((cat, idx) => (
                  <div
                    key={cat.code || idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={cat.enabled}
                        onChange={() => handleToggleCategory(idx)}
                        className="w-4 h-4 rounded-sm bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-white">{cat.name}</div>
                        <div className="text-[11px] text-slate-400">{cat.description || cat.code}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={cat.rate}
                        onChange={(e) => handleCategoryRateChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-right font-bold text-white text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                      <span className="text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Reason & Save Trigger */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Audit Log Justification / Reason for Modification
                </label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g. Approved GST Council rate revision"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Effective Date: Immediate upon MongoDB commit</span>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Saving to MongoDB...' : 'Save & Publish Rates'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Calculation Verifier & Metadata (1 col) */}
        <div className="space-y-6">
          {/* Illustrative Calculator Card */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Tax Calculation Verifier</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live verification matching prompt specifications. GST is calculated solely on the discounted taxable rental amount.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Base Rental Amount (₹)
                </label>
                <input
                  type="number"
                  step="500"
                  value={calcBaseAmount}
                  onChange={(e) => setCalcBaseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Promotional Discount (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={calcDiscountPercent}
                  onChange={(e) => setCalcDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Breakdown Table */}
              <div className="pt-3 border-t border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Rental:</span>
                  <span className="font-semibold text-white">₹{calcBaseAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({calcDiscountPercent}%):</span>
                  <span>- ₹{calcDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-850">
                  <span>Taxable Rental Amount:</span>
                  <span>₹{calcTaxableAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-blue-400 font-semibold">
                  <span>GST ({currentGstPct}%):</span>
                  <span>+ ₹{calcGstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-emerald-400">₹{calcTotalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Metadata Card */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Configuration Metadata</span>
            </h3>

            <div className="space-y-2 pt-1 text-slate-400">
              <div className="flex justify-between">
                <span>Last Updated By:</span>
                <span className="font-semibold text-slate-200">{settings?.updatedBy || 'admin'}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated At:</span>
                <span className="font-mono text-slate-300">
                  {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Effective Date:</span>
                <span className="font-mono text-slate-300">
                  {settings?.effectiveFrom ? new Date(settings.effectiveFrom).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 leading-relaxed mt-4">
              <Info className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
              Existing finalized bookings will permanently retain their saved GST rates unless an authorized financial adjustment is executed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
