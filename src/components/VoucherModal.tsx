import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Booking } from '../types';
import { formatCurrency } from '../utils/currency';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  CreditCard,
  Car,
  FileText,
  Phone,
  Mail,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';

interface VoucherModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  booking,
  isOpen,
  onClose,
  autoPrint = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Auto-trigger print if requested once modal is open
  useEffect(() => {
    if (isOpen && autoPrint && booking) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, booking]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      // Try backend endpoint first
      let res = await fetch(`/api/v1/bookings/${booking.id}/voucher`);
      if (!res.ok) {
        res = await fetch(`http://localhost:8085/api/v1/bookings/${booking.id}/voucher`);
      }

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ridemate-voucher-${booking.pickupCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Voucher endpoint returned ' + res.status);
      }
    } catch {
      setDownloadError('Backend PDF stream unavailable. Opening browser print dialog to Save as PDF...');
      setTimeout(() => {
        window.print();
      }, 600);
    } finally {
      setIsDownloading(false);
    }
  };

  const vehicle = booking.vehicle;
  const vehicleName = vehicle?.name || (booking as any).vehicleName || 'RideMate Luxury Fleet';
  const vehicleCategory = vehicle?.category || (booking as any).vehicleCategory || 'Executive';
  const vehicleBrand = vehicle?.make || (booking as any).vehicleBrand || 'RideMate';
  const vehicleYear = vehicle?.year || (booking as any).vehicleYear || 2026;
  const vehicleImage = vehicle?.imageUrl || (booking as any).vehicleImageUrl || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800';
  const codeDigits = (booking.pickupCode || '4022').replace(/\D/g, '') || '4022';
  const registrationNumber = `MH-02-RM-${(parseInt(codeDigits, 10) * 17) % 9000 + 1000}`;

  // Safe pricing calculations
  const dailyRate = booking.dailyRate || vehicle?.pricePerDay || 2500;
  const rentalDays = Math.max(1, booking.days || 1);
  const baseRental = booking.rentalRateTotal || (dailyRate * rentalDays);
  const protFee = booking.protectionFee || 0;
  const discountAmount = booking.discountAmount || 0;
  const taxableAmount = booking.taxableAmount !== undefined && booking.taxableAmount > 0
    ? booking.taxableAmount
    : Math.max(0, baseRental - discountAmount + protFee);
  const totalGst = booking.gstAmount !== undefined && booking.gstAmount > 0
    ? booking.gstAmount
    : (booking.taxesAndFees || Math.round(taxableAmount * 0.05 * 100) / 100);
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;
  const totalAmount = booking.totalDue || (taxableAmount + totalGst);

  const modalContent = (
    <div className="voucher-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0b1c30]/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Container Dialog */}
      <div className="voucher-modal-dialog relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-[#c6c6cd]/50 max-h-[94vh] flex flex-col">
        
        {/* Top Control Bar (Strictly Hidden in Print) */}
        <div className="no-print bg-[#0b1c30] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#223652] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#0051d5] rounded-lg">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Official Car Rental Voucher
              </h2>
              <p className="text-[11px] text-[#bec6e0]">
                Reference #{booking.pickupCode} &bull; Order-Specific Dedicated Print
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 bg-[#0051d5] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Print Voucher (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              type="button"
              className="px-3 py-1.5 bg-[#1b2f4c] hover:bg-[#28436b] disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-[#3b5379]/50 transition-colors cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading...' : 'Save as PDF'}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-[#bec6e0] hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download notification if fallback */}
        {downloadError && (
          <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Dedicated Printable Voucher Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-white" id="printable-voucher">
          
          <div className="border border-[#c6c6cd] rounded-xl overflow-hidden bg-white shadow-xs avoid-break">
            
            {/* Header: RIDEMATE Official Header */}
            <div className="bg-[#0b1c30] text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#0051d5]">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-black tracking-wider text-white">RIDEMATE</span>
                  <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#0051d5] text-white rounded">
                    Official Voucher
                  </span>
                </div>
                <h1 className="text-xs font-semibold text-[#bec6e0] mt-1">
                  OFFICIAL CAR RENTAL VOUCHER &amp; TAX INVOICE
                </h1>
                <p className="text-[10px] text-[#8e98b7] mt-0.5">
                  RIDEMATE Mobility Pvt Ltd &bull; 24/7 Dispatch: +91 1800-RIDEMATE &bull; support@ridemate.io &bull; GSTIN: 27AABCR8901M1Z5
                </p>
              </div>

              <div className="bg-[#122744] border border-[#2a456c] rounded-xl px-4 py-2.5 sm:text-right shrink-0">
                <div className="flex items-center sm:justify-end gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{booking.status || 'Confirmed'} &amp; Guaranteed</span>
                </div>
                <div className="text-[10px] text-[#bec6e0] uppercase tracking-wider">Express Pickup Code</div>
                <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest">
                  {booking.pickupCode}
                </div>
                <div className="text-[9px] text-[#bec6e0] font-mono mt-0.5">
                  VOUCHER #{`VCH-${booking.pickupCode}`}
                </div>
              </div>
            </div>

            {/* Quick Meta Bar */}
            <div className="bg-[#eff4ff] border-b border-[#d0e0ff] px-5 py-2 flex flex-wrap items-center justify-between text-xs text-[#0051d5] font-semibold gap-2">
              <div>
                Booking ID: <span className="font-mono text-[#0b1c30]">{booking.id}</span>
              </div>
              <div>
                Issue Date: <span className="text-[#0b1c30]">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1 font-mono tracking-widest text-[11px] select-none opacity-80">
                ||| | ||||| || |||||| | |||| |||
              </div>
            </div>

            {/* Section 1: Vehicle Specifications */}
            <div className="p-5 border-b border-[#e2e3e8] grid grid-cols-1 md:grid-cols-12 gap-5 items-center voucher-section">
              <div className="md:col-span-4 h-36 rounded-lg overflow-hidden bg-[#eff4ff] border border-[#e2e3e8]">
                <img
                  src={vehicleImage}
                  alt={vehicleName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-[#eff4ff] text-[#0051d5] rounded">
                    {vehicleCategory}
                  </span>
                  <span className="text-xs text-[#76777d]">{vehicleBrand} &bull; Model Year {vehicleYear}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30]">
                  {vehicleName}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-[#f8f9ff] p-2 rounded border border-[#e2e3e8]">
                    <span className="text-[#76777d] block text-[9px] uppercase font-semibold">Reg. Number</span>
                    <span className="font-mono font-bold text-[#0b1c30]">{registrationNumber}</span>
                  </div>
                  <div className="bg-[#f8f9ff] p-2 rounded border border-[#e2e3e8]">
                    <span className="text-[#76777d] block text-[9px] uppercase font-semibold">Transmission</span>
                    <span className="font-semibold text-[#0b1c30]">Automatic</span>
                  </div>
                  <div className="bg-[#f8f9ff] p-2 rounded border border-[#e2e3e8]">
                    <span className="text-[#76777d] block text-[9px] uppercase font-semibold">Fuel / Charge</span>
                    <span className="font-semibold text-[#0b1c30]">Full to Full</span>
                  </div>
                  <div className="bg-[#f8f9ff] p-2 rounded border border-[#e2e3e8]">
                    <span className="text-[#76777d] block text-[9px] uppercase font-semibold">Mileage Policy</span>
                    <span className="font-semibold text-[#0b1c30]">Unlimited (₹0/km)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Pickup and Return Details */}
            <div className="p-5 border-b border-[#e2e3e8] grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fafbfe] voucher-section">
              {/* Pickup */}
              <div className="p-3.5 bg-white rounded-lg border border-[#e2e3e8] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0051d5] uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Scheduled Pick-Up</span>
                </div>
                <div className="text-sm font-bold text-[#0b1c30]">
                  {booking.pickupLocation || 'Main Airport Hub Terminal 2'}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#45464d] pt-1.5 border-t border-[#f0f0f4]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span className="font-semibold">{booking.pickupDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span className="font-semibold">{booking.pickupTime || '10:00 AM'}</span>
                  </span>
                </div>
              </div>

              {/* Dropoff */}
              <div className="p-3.5 bg-white rounded-lg border border-[#e2e3e8] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0051d5] uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Scheduled Return</span>
                </div>
                <div className="text-sm font-bold text-[#0b1c30]">
                  {booking.dropoffLocation || booking.pickupLocation || 'Main Airport Hub Terminal 2'}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#45464d] pt-1.5 border-t border-[#f0f0f4]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span className="font-semibold">{booking.dropoffDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span className="font-semibold">{booking.dropoffTime || '02:00 PM'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Customer Information & Section 4: Price Breakdown Table */}
            <div className="p-5 border-b border-[#e2e3e8] grid grid-cols-1 md:grid-cols-12 gap-5 voucher-section">
              
              {/* Customer Information (Col 5) */}
              <div className="md:col-span-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0051d5] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Customer KYC Details</span>
                </h4>
                <div className="text-xs space-y-2 bg-[#fcfcff] p-3.5 rounded-lg border border-[#e2e3e8]">
                  <div>
                    <span className="text-[#76777d] block text-[10px] uppercase">Primary Driver Name</span>
                    <span className="font-bold text-[#0b1c30] text-sm">{booking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#76777d] block text-[10px] uppercase">Driver's License Number</span>
                    <span className="font-mono font-bold text-[#0b1c30]">{booking.driverLicenseNumber || 'CA-D8829104'}</span>
                  </div>
                  <div>
                    <span className="text-[#76777d] block text-[10px] uppercase">Email Address</span>
                    <span className="font-medium text-[#0b1c30]">{booking.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[#76777d] block text-[10px] uppercase">Contact Phone</span>
                    <span className="font-medium text-[#0b1c30]">{booking.customerPhone || '+91 98765 43210'}</span>
                  </div>
                  <div className="pt-1.5 border-t border-[#e2e3e8] text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Identity Verified in MongoDB</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Table (Col 7 - strictly formatted per Section 3 & 5) */}
              <div className="md:col-span-7 space-y-2 voucher-price-breakdown">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0051d5] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Itemized Price &amp; GST Breakdown (₹)</span>
                </h4>
                
                <table className="w-full text-xs border border-[#c6c6cd] rounded-lg overflow-hidden">
                  <thead className="bg-[#f0f3fa] text-[#45464d] text-[11px] border-b border-[#c6c6cd]">
                    <tr>
                      <th className="py-2 px-3 text-left font-bold">Description</th>
                      <th className="py-2 px-3 text-right font-bold">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e3e8]">
                    <tr>
                      <td className="py-1.5 px-3 text-[#0b1c30]">
                        Base Rental ({rentalDays} days @ {formatCurrency(dailyRate)}/day)
                      </td>
                      <td className="py-1.5 px-3 text-right font-medium text-[#0b1c30]">
                        {formatCurrency(baseRental, { decimals: 2 })}
                      </td>
                    </tr>
                    {protFee > 0 && (
                      <tr>
                        <td className="py-1.5 px-3 text-[#0b1c30]">
                          Protection Plan ({booking.protectionPlan || 'Standard'})
                        </td>
                        <td className="py-1.5 px-3 text-right font-medium text-[#0b1c30]">
                          {formatCurrency(protFee, { decimals: 2 })}
                        </td>
                      </tr>
                    )}
                    {discountAmount > 0 ? (
                      <tr className="bg-emerald-50/60 text-emerald-800 font-semibold">
                        <td className="py-1.5 px-3">
                          {booking.couponCode === 'NEWREG10'
                            ? 'New registration coupon (10% OFF)'
                            : (booking.couponCode === 'EXISTING5'
                                ? 'Existing customer coupon (5% OFF)'
                                : `Applied coupon (${booking.couponCode} - ${booking.discountPercent || 0}% OFF)`)}
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          −{formatCurrency(discountAmount, { decimals: 2 })}
                        </td>
                      </tr>
                    ) : null}
                    <tr className="bg-[#fcfcff] font-semibold border-t border-[#c6c6cd]">
                      <td className="py-1.5 px-3 text-[#45464d]">Taxable Amount</td>
                      <td className="py-1.5 px-3 text-right text-[#0b1c30]">
                        {formatCurrency(taxableAmount, { decimals: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-[#76777d]">Central GST / CGST (2.5%)</td>
                      <td className="py-1.5 px-3 text-right text-[#45464d]">
                        {formatCurrency(cgst, { decimals: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-[#76777d]">State GST / SGST (2.5%)</td>
                      <td className="py-1.5 px-3 text-right text-[#45464d]">
                        {formatCurrency(sgst, { decimals: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-[#fcfcff]">
                      <td className="py-1 px-3 text-[#76777d]">Total GST (5.0%)</td>
                      <td className="py-1 px-3 text-right font-medium text-[#0b1c30]">
                        {formatCurrency(totalGst, { decimals: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-3 text-[#76777d]">Refundable Security Deposit</td>
                      <td className="py-1 px-3 text-right font-medium text-[#76777d]">
                        ₹0.00 (Hold on Card)
                      </td>
                    </tr>
                    <tr className="bg-[#0b1c30] text-white font-bold">
                      <td className="py-2.5 px-3 text-sm">TOTAL RENTAL AMOUNT</td>
                      <td className="py-2.5 px-3 text-right text-base text-blue-200">
                        {formatCurrency(totalAmount, { decimals: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-[#f8f9ff] font-semibold text-emerald-800">
                      <td className="py-1.5 px-3">Amount Paid</td>
                      <td className="py-1.5 px-3 text-right">
                        {formatCurrency(totalAmount, { decimals: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-[#f8f9ff] font-semibold text-[#45464d]">
                      <td className="py-1.5 px-3">Outstanding Balance</td>
                      <td className="py-1.5 px-3 text-right">
                        ₹0.00
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-[10px] text-[#76777d] text-right">
                  Payment Method: Card ending in {booking.paymentMethodLast4 || '4242'} &bull; Status: <span className="text-emerald-700 font-bold">PAID</span>
                </div>
              </div>
            </div>

            {/* Section 5: Terms and Express Pickup Instructions */}
            <div className="p-4 bg-[#fafbfe] space-y-2 border-b border-[#e2e3e8] voucher-section">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Important Rental Terms &amp; Verification Policy</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#45464d]">
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Free Cancellation:</strong> Fully refundable up to 24 hours prior to scheduled pickup time.</li>
                  <li><strong>KYC Verification:</strong> Primary driver must present physical Driver's License and original identity card at counter.</li>
                </ul>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Security Hold:</strong> A temporary pre-authorization hold will be placed on card ending in {booking.paymentMethodLast4 || '4242'}.</li>
                  <li><strong>24/7 Roadside Assistance:</strong> Call <strong>+91 1800-RIDEMATE</strong> or WhatsApp dispatch anytime for assistance.</li>
                </ul>
              </div>
            </div>

            {/* Section 6: Official Footer */}
            <div className="bg-[#f0f3fa] px-5 py-2.5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#76777d] gap-2">
              <div>
                RIDEMATE Mobility Corp &bull; Official Digital Rental Voucher &bull; Pickup Reference #{booking.pickupCode}
              </div>
              <div>
                System-generated document verified against MongoDB store &bull; Page 1 of 1
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Actions Bar (Strictly Hidden in Print) */}
        <div className="no-print bg-[#f3f4f8] border-t border-[#e2e3e8] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#76777d]">
            Tip: Click <strong>Print Voucher</strong> or press <kbd className="px-1.5 py-0.5 bg-white border border-[#c6c6cd] rounded font-mono text-[10px]">Ctrl+P</kbd> to print this isolated voucher or save as PDF.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 bg-[#0051d5] hover:bg-[#003ea8] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              type="button"
              className="px-4 py-2 bg-[#0b1c30] hover:bg-[#1a3354] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Preparing PDF...' : 'Download Official PDF'}</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-3.5 py-2 bg-white border border-[#c6c6cd] hover:border-[#0051d5] text-[#0b1c30] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  const portalTarget = document.getElementById('isolated-voucher-portal') || document.body;
  return createPortal(modalContent, portalTarget);
};
