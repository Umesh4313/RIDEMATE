import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Printer, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Car, 
  Calendar, 
  DollarSign, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  X,
  RotateCw
} from 'lucide-react';
import { VoucherAdminItem } from '../../types';
import { adminService } from '../../services/adminService';

interface AdminVouchersProps {
  initialBookingRef?: string;
}

export const AdminVouchers: React.FC<AdminVouchersProps> = ({ initialBookingRef }) => {
  const [vouchers, setVouchers] = useState<VoucherAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialBookingRef || '');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherAdminItem | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadVouchers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getVouchers('');
      setVouchers(data || []);
      if (initialBookingRef && data.length > 0) {
        const found = data.find((v) => v.bookingReference === initialBookingRef);
        if (found) setSelectedVoucher(found);
      }
    } catch (e) {
      console.error('Error fetching vouchers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [initialBookingRef]);

  const handlePrintVoucher = () => {
    window.print();
  };

  const handleRegenerate = async (bRef: string) => {
    setIsRegenerating(true);
    try {
      const updated = await adminService.regenerateVoucher(bRef, 'Admin requested voucher reissue');
      setSelectedVoucher(updated);
      setFeedbackMessage(`Voucher ${updated.voucherReference} reissued successfully. Audit trail logged.`);
      loadVouchers();
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      v.bookingReference?.toLowerCase().includes(q) ||
      v.voucherReference?.toLowerCase().includes(q) ||
      v.customerName?.toLowerCase().includes(q) ||
      v.carModel?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Printable CSS style: guarantees ONLY the voucher prints, hiding sidebar and all navigation */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #isolated-printable-voucher, #isolated-printable-voucher * {
            visibility: visible !important;
          }
          #isolated-printable-voucher {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            <span>Rental Confirmation & PDF Documents</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Generated Vouchers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official customer rental vouchers with immutable statutory GST breakdowns, vehicle identifiers, and isolated printing.
          </p>
        </div>

        <button
          onClick={loadVouchers}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Vouchers</span>
        </button>
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

      {/* Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vouchers by booking ref (RM-2026-00125), voucher code (VCH-RM-00125), customer (Priya Sharma)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Voucher Ref</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Car Model</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No vouchers found matching search query.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr
                    key={v.voucherReference}
                    onClick={() => setSelectedVoucher(v)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {v.voucherReference}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {v.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{v.customerName}</div>
                      <div className="text-[10px] text-slate-400">{v.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">{v.carModel}</td>
                    <td className="py-3 px-4 text-slate-400">{v.issueDate}</td>
                    <td className="py-3 px-4 font-extrabold text-white">
                      ₹{Math.round(v.totalPayableAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoucher(v);
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold"
                      >
                        Open Voucher
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Isolated Voucher Modal with Dedicated Print Support (Req 8) */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[95vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white">Rental Voucher Preview</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRegenerate(selectedVoucher.bookingReference)}
                  disabled={isRegenerating}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  title="Reissue Voucher"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <button
                  onClick={handlePrintVoucher}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>

                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* This DOM Element is the ONLY element visible in print view via CSS */}
            <div id="isolated-printable-voucher" className="bg-white text-slate-900 rounded-xl p-8 border border-slate-200 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-2xl font-black font-serif text-[#0051d5] tracking-tight">RIDEMATE</div>
                  <p className="text-xs text-slate-500 mt-0.5">Drive Your Ambition — Official Rental Voucher</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase">Voucher Reference</div>
                  <div className="font-mono text-sm font-extrabold text-slate-900">{selectedVoucher.voucherReference}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Issued: {selectedVoucher.issueDate}</div>
                </div>
              </div>

              {/* Customer & Itinerary */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Renter Information</span>
                  <div className="font-extrabold text-sm text-slate-900">{selectedVoucher.customerName}</div>
                  <div className="text-slate-600">{selectedVoucher.customerEmail}</div>
                  <div className="font-mono text-[11px] text-slate-500">Booking: {selectedVoucher.bookingReference}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Vehicle</span>
                  <div className="font-extrabold text-sm text-slate-900">{selectedVoucher.carModel}</div>
                  <div className="text-slate-600">Category: {selectedVoucher.category || 'Luxury Sport'}</div>
                  <div className="text-[11px] text-slate-500">Dates: {selectedVoucher.startDate} to {selectedVoucher.endDate}</div>
                </div>
              </div>

              {/* Exact Itemized Tax and Financial Breakdown (Req 8 Example) */}
              <div className="space-y-2 border-t border-slate-200 pt-4 text-xs">
                <div className="font-bold text-slate-800 text-sm mb-2">Finalized Financial Summary</div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Rental Amount:</span>
                  <span className="font-semibold text-slate-900">₹{Math.round(selectedVoucher.baseRentalAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                {selectedVoucher.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({selectedVoucher.discountPercentage || 10}%):</span>
                    <span>- ₹{Math.round(selectedVoucher.discountAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
                  <span>Taxable Rental Amount:</span>
                  <span>₹{Math.round(selectedVoucher.taxableRentalAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between font-semibold text-blue-700">
                  <span>Statutory GST ({((selectedVoucher.gstRate || 0.05) * 100).toFixed(1)}%):</span>
                  <span>+ ₹{Math.round(selectedVoucher.gstAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                {selectedVoucher.additionalCharges > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Additional Charges:</span>
                    <span>+ ₹{Math.round(selectedVoucher.additionalCharges || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t-2 border-slate-900">
                  <span>Total Amount Paid / Finalized:</span>
                  <span className="text-[#0051d5]">₹{Math.round(selectedVoucher.totalPayableAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms footer */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
                This document serves as the legal voucher for key handover. Driver must present original driver license and valid national ID card at vehicle pickup. Tax calculated under applicable statutory GST provisions.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
