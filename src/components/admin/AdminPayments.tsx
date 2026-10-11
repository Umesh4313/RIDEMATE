import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign, 
  ExternalLink,
  Receipt,
  X,
  AlertTriangle
} from 'lucide-react';
import { PaymentAdminItem } from '../../types';
import { adminService } from '../../services/adminService';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected payment detail modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentAdminItem | null>(null);

  // Refund processing modal
  const [refundModalOpen, setRefundModalOpen] = useState<boolean>(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('Customer cancellation refund');
  const [isRefunding, setIsRefunding] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPayments('', statusFilter === 'ALL' ? '' : statusFilter);
      setPayments(data || []);
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setIsRefunding(true);
    try {
      await adminService.processRefund(
        selectedPayment.bookingReference,
        refundAmount,
        refundReason.trim() || 'Admin manual refund'
      );
      setFeedbackMessage(`Refund of ₹${refundAmount.toLocaleString('en-IN')} processed for ${selectedPayment.bookingReference}. Audit log recorded in MongoDB.`);
      setRefundModalOpen(false);
      loadPayments();
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    } finally {
      setIsRefunding(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      p.bookingReference?.toLowerCase().includes(q) ||
      p.transactionReference?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Financial Transactions & Gateway Records</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Payment Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction ledger from trusted gateway flows with immutable statutory tax breakdown, refund tracking, and PCI compliance.
          </p>
        </div>

        <button
          onClick={loadPayments}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Ledger</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by txn reference (TXN-789456), booking ref (RM-2026-00125), or customer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Txn Reference</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount Charged</th>
                <th className="py-3 px-4">GST Included</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.transactionReference}
                    onClick={() => setSelectedPayment(p)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {p.transactionReference}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {p.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{p.customerName}</div>
                      <div className="text-[10px] text-slate-400">{p.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                        {p.paymentMethod || 'UPI'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-white">
                      ₹{Math.round(p.amountCharged || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-400">
                      ₹{Math.round(p.gstAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          p.paymentStatus?.toLowerCase() === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : p.paymentStatus?.toLowerCase() === 'refunded'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {p.paymentStatus || 'Paid'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(p);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold border border-slate-700"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail & Refund Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Transaction Verification</span>
                <h3 className="text-xl font-bold font-mono text-white">{selectedPayment.transactionReference}</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Associated Booking:</span>
                <span className="font-mono font-bold text-blue-400">{selectedPayment.bookingReference}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-white">{selectedPayment.customerName} ({selectedPayment.customerEmail})</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="font-semibold text-slate-200">{selectedPayment.paymentMethod || 'UPI / Instant Bank Pay'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Total Charged:</span>
                <span className="font-extrabold text-emerald-400 text-sm">₹{Math.round(selectedPayment.amountCharged || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Statutory GST Collected:</span>
                <span className="font-semibold text-blue-400">₹{Math.round(selectedPayment.gstAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              {selectedPayment.refundAmount > 0 && (
                <div className="flex justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <span>Refunded to Customer:</span>
                  <span className="font-bold">- ₹{Math.round(selectedPayment.refundAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setRefundAmount(selectedPayment.amountCharged);
                  setRefundModalOpen(true);
                }}
                disabled={selectedPayment.paymentStatus === 'REFUNDED'}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors disabled:opacity-40"
              >
                Process Refund
              </button>

              <button
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Execution Modal */}
      {refundModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleProcessRefund}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">Execute Payment Refund</h3>
            </div>
            <p className="text-xs text-slate-300">
              Processing refund for booking <strong className="text-white">{selectedPayment.bookingReference}</strong>. Requires administrative authorization.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedPayment.amountCharged}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Reason for Refund (Mandatory Audit Trail)
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  placeholder="e.g. Approved booking cancellation under policy window"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRefunding}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isRefunding ? 'Refunding...' : 'Confirm Refund & Log Audit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
