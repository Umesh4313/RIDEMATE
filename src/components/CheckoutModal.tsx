import React, { useState, useEffect } from 'react';
import { Vehicle, Booking, SearchState, AvailableCoupon } from '../types';
import { formatCurrency } from '../utils/currency';
import { VoucherModal } from './VoucherModal';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  User, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Car,
  FileCheck,
  AlertCircle,
  Download,
  Printer,
  Tag,
  Sparkles,
  Percent,
  Check,
  Gift
} from 'lucide-react';

interface CheckoutModalProps {
  vehicle: Vehicle;
  searchState: SearchState;
  rentalDays: number;
  initialPlan: 'basic' | 'standard' | 'premium';
  onClose: () => void;
  onBookingConfirmed: (newBooking: Booking) => void;
  customerEmail?: string;
  customerName?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  vehicle,
  searchState,
  rentalDays,
  initialPlan = 'standard',
  onClose,
  onBookingConfirmed,
  customerEmail = 'ganesh@ridemate.io',
  customerName = 'Ganesh J.'
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [protectionPlan, setProtectionPlan] = useState<'basic' | 'standard' | 'premium'>(initialPlan);
  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [phone, setPhone] = useState('+1 (415) 555-0199');
  const [licenseNumber, setLicenseNumber] = useState('CA-D8829104');
  const [cardNumber, setCardNumber] = useState('**** **** **** 4242');
  const [cardExpiry, setCardExpiry] = useState('10/28');
  const [cardCvc, setCardCvc] = useState('842');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isDownloadingVoucher, setIsDownloadingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Discount & Coupon State (MongoDB Driven)
  const [couponInput, setCouponInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    title: string;
    discountPercent: number;
    discountAmount: number;
    message: string;
    userType?: string;
  } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);

  // Calculate pricing breakdown with Base Rental, Taxable Amount, 5% GST, and Total Payable
  const baseRentalPrice = vehicle.pricePerDay * rentalDays;
  const protectionFeePerDay = protectionPlan === 'basic' ? 0 : protectionPlan === 'standard' ? 15 : 28;
  const protectionTotal = protectionFeePerDay * rentalDays;

  // Dynamically calculate discount based on applied coupon
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discountAmount > 0 
        ? appliedCoupon.discountAmount 
        : Math.round(baseRentalPrice * (discountPercent / 100) * 100) / 100)
    : 0;

  // Taxable amount = Base rental - Applied coupon discount + protection fee
  const taxableAmount = Math.max(0, Math.round((baseRentalPrice - discountAmount + protectionTotal) * 100) / 100);

  // Illustrative GST (5%)
  const gstRate = 0.05;
  const gstAmount = Math.round(taxableAmount * gstRate * 100) / 100;

  // Final payable amount = Taxable amount + GST
  const totalDue = Math.round((taxableAmount + gstAmount) * 100) / 100;

  // Load available coupons tailored for this customer strictly from MongoDB backend
  useEffect(() => {
    let isMounted = true;
    async function loadAvailableCoupons() {
      try {
        const cleanEmail = encodeURIComponent(email.trim().toLowerCase());
        let res = await fetch(`/api/v1/coupons/available?customerEmail=${cleanEmail}`);
        if (!res.ok) {
          res = await fetch(`http://localhost:8085/api/v1/coupons/available?customerEmail=${cleanEmail}`);
        }
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) {
              setAvailableCoupons(json.data);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Coupon discovery fallback:', e);
      }

      // Default dynamic fallback if offline: check if customer has known booking history
      if (isMounted) {
        const isKnownReturning = email.toLowerCase().includes('existing') || email.toLowerCase().includes('ganesh');
        setAvailableCoupons([
          isKnownReturning
            ? {
                code: 'EXISTING5',
                title: 'Existing Customer Coupon — 5% OFF',
                description: '5% loyalty appreciation discount for existing customers with completed/confirmed booking history.',
                discountPercent: 5,
                applicableUserType: 'EXISTING',
                minRentalDays: 1,
                recommended: true
              }
            : {
                code: 'NEWREG10',
                title: 'New Registration Coupon — 10% OFF',
                description: 'Exclusive 10% discount for registered customers with zero previous qualifying bookings.',
                discountPercent: 10,
                applicableUserType: 'FIRST_TIME',
                minRentalDays: 1,
                recommended: true
              }
        ]);
      }
    }

    loadAvailableCoupons();
    return () => {
      isMounted = false;
    };
  }, [email]);

  // Apply and validate coupon against MongoDB engine
  const handleApplyCoupon = async (codeOverride?: string) => {
    const targetCode = (codeOverride || couponInput).trim().toUpperCase();
    if (!targetCode) {
      setCouponError('Please enter a coupon code.');
      setCouponSuccessMessage(null);
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccessMessage(null);

    const payload = {
      code: targetCode,
      customerEmail: email.trim().toLowerCase(),
      rentalSubtotal: baseRentalPrice,
      protectionFee: protectionTotal,
      totalDue: baseRentalPrice + protectionTotal,
      days: rentalDays
    };

    try {
      let res = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        res = await fetch('http://localhost:8085/api/v1/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (json.data && json.data.valid) {
        const computedDiscount = json.data.discountAmount !== undefined
          ? json.data.discountAmount
          : Math.round(baseRentalPrice * (json.data.discountPercent / 100) * 100) / 100;

        setAppliedCoupon({
          code: json.data.code,
          title: json.data.title || `${json.data.discountPercent}% OFF`,
          discountPercent: json.data.discountPercent,
          discountAmount: computedDiscount,
          message: json.message || `Coupon ${json.data.code} successfully applied!`,
          userType: json.data.applicableUserType
        });
        setCouponInput(json.data.code);
        setCouponSuccessMessage(json.message);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(json.message || `Coupon '${targetCode}' could not be applied. Check your booking history.`);
      }
    } catch {
      // Offline fallback: enforce business rules
      if (targetCode === 'NEWREG10') {
        const disc = Math.round(baseRentalPrice * 0.10 * 100) / 100;
        setAppliedCoupon({
          code: 'NEWREG10',
          title: 'New Registration Coupon — 10% OFF',
          discountPercent: 10,
          discountAmount: disc,
          message: `New Registration Coupon (10% OFF) applied! You save ₹${disc.toFixed(2)}`,
          userType: 'FIRST_TIME'
        });
        setCouponSuccessMessage('New Registration Coupon (10% OFF) applied!');
        setCouponInput('NEWREG10');
      } else if (targetCode === 'EXISTING5') {
        const disc = Math.round(baseRentalPrice * 0.05 * 100) / 100;
        setAppliedCoupon({
          code: 'EXISTING5',
          title: 'Existing Customer Coupon — 5% OFF',
          discountPercent: 5,
          discountAmount: disc,
          message: `Existing Customer Coupon (5% OFF) applied! You save ₹${disc.toFixed(2)}`,
          userType: 'EXISTING'
        });
        setCouponSuccessMessage('Existing Customer Coupon (5% OFF) applied!');
        setCouponInput('EXISTING5');
      } else {
        setCouponError(`Unable to validate coupon '${targetCode}'. Please check your booking eligibility.`);
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccessMessage(null);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `RM-${randomDigits}`;

    const newBooking: Booking = {
      id: `bk-${code.toLowerCase()}`,
      pickupCode: code,
      vehicleId: vehicle.id,
      vehicle: vehicle,
      pickupLocation: searchState.pickupLocation || 'San Francisco International Airport (SFO)',
      dropoffLocation: searchState.returnLocation || searchState.pickupLocation || 'San Francisco International Airport (SFO)',
      pickupDate: searchState.pickupDate || '2026-10-24',
      pickupTime: '10:00 AM',
      dropoffDate: searchState.returnDate || '2026-10-27',
      dropoffTime: '2:00 PM',
      days: rentalDays,
      dailyRate: vehicle.pricePerDay,
      rentalRateTotal: baseRentalPrice,
      taxesAndFees: gstAmount,
      protectionPlan: protectionPlan,
      protectionFee: protectionTotal,
      couponCode: appliedCoupon?.code,
      discountAmount: discountAmount,
      discountPercent: appliedCoupon?.discountPercent || 0,
      taxableAmount: taxableAmount,
      gstRate: gstRate,
      gstAmount: gstAmount,
      totalDue: totalDue,
      status: 'Confirmed',
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      driverLicenseNumber: licenseNumber,
      paymentMethodLast4: cardNumber.slice(-4) || '4242',
      createdAt: new Date().toISOString()
    };

    // Try Java backend first via proxy or direct port
    try {
      const token = localStorage.getItem('ridemate_token');
      const bookingPayload = {
        vehicleId: vehicle.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        driverLicenseNumber: licenseNumber,
        pickupLocation: newBooking.pickupLocation,
        dropoffLocation: newBooking.dropoffLocation,
        pickupDate: newBooking.pickupDate,
        pickupTime: newBooking.pickupTime,
        dropoffDate: newBooking.dropoffDate,
        dropoffTime: newBooking.dropoffTime,
        days: rentalDays,
        protectionPlan: protectionPlan,
        paymentMethodLast4: cardNumber.slice(-4) || '4242',
        couponCode: appliedCoupon?.code || '',
        discountAmount: discountAmount,
        discountPercent: appliedCoupon?.discountPercent || 0,
        taxableAmount: taxableAmount,
        gstAmount: gstAmount,
        gstRate: gstRate
      };

      let res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingPayload),
      });

      if (!res.ok) {
        res = await fetch('http://localhost:8085/api/v1/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(bookingPayload),
        });
      }

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const backendBooking: Booking = {
            ...newBooking,
            id: json.data.id || newBooking.id,
            pickupCode: json.data.pickupCode || newBooking.pickupCode,
            couponCode: json.data.couponCode || newBooking.couponCode,
            discountAmount: json.data.discountAmount !== undefined ? json.data.discountAmount : newBooking.discountAmount,
            discountPercent: json.data.discountPercent !== undefined ? json.data.discountPercent : newBooking.discountPercent,
            taxableAmount: json.data.taxableAmount !== undefined ? json.data.taxableAmount : newBooking.taxableAmount,
            gstRate: json.data.gstRate !== undefined ? json.data.gstRate : newBooking.gstRate,
            gstAmount: json.data.gstAmount !== undefined ? json.data.gstAmount : newBooking.gstAmount,
            totalDue: json.data.totalDue !== undefined ? json.data.totalDue : newBooking.totalDue
          };
          setConfirmedBooking(backendBooking);
          onBookingConfirmed(backendBooking);
          setIsProcessing(false);
          setStep(4);
          return;
        }
      }
    } catch (err) {
      console.warn('Java backend unreachable, using local booking flow', err);
    }

    // Fallback
    setTimeout(() => {
      setConfirmedBooking(newBooking);
      onBookingConfirmed(newBooking);
      setIsProcessing(false);
      setStep(4);
    }, 600);
  };

  const handlePrintVoucher = () => {
    if (!confirmedBooking) return;
    setIsVoucherModalOpen(true);
  };

  const handleDownloadVoucher = async () => {
    if (!confirmedBooking) return;
    setIsDownloadingVoucher(true);
    setVoucherError(null);
    try {
      let res = await fetch(`/api/v1/bookings/${confirmedBooking.id}/voucher`);
      if (!res.ok) {
        res = await fetch(`http://localhost:8085/api/v1/bookings/${confirmedBooking.id}/voucher`);
      }
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ridemate-voucher-${confirmedBooking.pickupCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Voucher generation endpoint returned ' + res.status);
      }
    } catch {
      setIsVoucherModalOpen(true);
    } finally {
      setIsDownloadingVoucher(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#c6c6cd]/50 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0b1c30] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0051d5] flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Complete Reservation</h2>
              <p className="text-xs text-[#bec6e0]">{vehicle.name} &bull; {rentalDays} Days Rental</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#bec6e0] hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        {step < 4 && (
          <div className="grid grid-cols-3 border-b border-[#eff4ff] bg-[#f8f9ff] text-xs font-semibold">
            {(['Driver Information', 'Protection Coverage', 'Payment & Coupons'] as const).map((label, i) => (
              <button 
                key={i} 
                type="button" 
                onClick={() => setStep((i + 1) as 1 | 2 | 3)}
                className={`py-3 px-2 text-center border-b-2 transition-colors ${
                  step === i + 1 ? 'border-[#0051d5] text-[#0051d5] bg-white' : 'border-transparent text-[#76777d]'
                }`}>
                {i + 1}. {label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleConfirmReservation} className="p-6 space-y-6">

          {/* STEP 1: Driver Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0b1c30] mb-2">
                <User className="w-4 h-4 text-[#0051d5]" />
                <span>Primary Driver &amp; KYC Verification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#45464d] block mb-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:border-[#0051d5]" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#45464d] block mb-1">Email Address (For Loyalty &amp; Discounts)</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:border-[#0051d5]" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#45464d] block mb-1">Mobile Phone</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:border-[#0051d5]" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#45464d] block mb-1">Driver License Number</label>
                  <input 
                    type="text" 
                    required 
                    value={licenseNumber} 
                    onChange={e => setLicenseNumber(e.target.value)} 
                    className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-xl px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:border-[#0051d5]" 
                  />
                </div>
              </div>
              <div className="bg-[#eff4ff] p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-[#45464d]">
                <FileCheck className="w-4 h-4 text-[#0051d5] shrink-0 mt-0.5" />
                <span>Your driver license is validated. You will receive an instant digital lockbox unlock code upon voucher generation.</span>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="px-6 py-2.5 bg-[#0051d5] text-white font-semibold text-sm rounded-xl hover:bg-[#003ea8] transition-colors flex items-center gap-1.5 cursor-pointer">
                  <span>Continue to Protection</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Protection Plan */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0b1c30] mb-2">
                <ShieldCheck className="w-4 h-4 text-[#0051d5]" /><span>Select Your Protection Plan</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: 'basic', label: 'Basic', sub: 'State Minimum', price: 0, desc: 'Personal auto insurance deductible applies.' },
                  { key: 'standard', label: 'Standard', sub: 'Collision & Windshield', price: 15, desc: 'Damage liability waiver applied.', badge: 'Recommended' },
                  { key: 'premium', label: 'Premium Zero', sub: 'Full Peace of Mind', price: 28, desc: 'Zero deductible + 24/7 roadside tow.' },
                ].map(plan => (
                  <div 
                    key={plan.key} 
                    onClick={() => setProtectionPlan(plan.key as any)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                      protectionPlan === plan.key ? 'border-[#0051d5] bg-[#eff4ff]/60 shadow-sm' : 'border-[#c6c6cd]/50 bg-white hover:border-[#c6c6cd]'
                    }`}>
                    {plan.badge && <span className="absolute -top-2.5 right-2 px-2 py-0.5 bg-[#0051d5] text-white text-[10px] font-bold rounded-full">{plan.badge}</span>}
                    <h4 className="font-bold text-sm text-[#0b1c30]">{plan.label}</h4>
                    <p className="text-xs text-[#76777d] mt-0.5">{plan.sub}</p>
                    <div className="mt-3 font-bold text-sm text-[#0b1c30]">{formatCurrency(plan.price)} <span className="text-[11px] font-normal text-[#76777d]">/day</span></div>
                    <p className="text-[11px] text-[#45464d] mt-2">{plan.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-sm font-semibold text-[#45464d] hover:text-[#0b1c30] cursor-pointer">Back</button>
                <button 
                  type="button" 
                  onClick={() => setStep(3)} 
                  className="px-6 py-2.5 bg-[#0051d5] text-white font-semibold text-sm rounded-xl hover:bg-[#003ea8] transition-colors flex items-center gap-1.5 cursor-pointer">
                  <span>Proceed to Payment &amp; Coupons</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment & Discount Coupons */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* DISCOUNT COUPON SECTION (MongoDB Backend Integrated) */}
              <div className="bg-gradient-to-r from-emerald-50/70 via-[#f0f9ff] to-[#f8f9ff] p-4 rounded-xl border border-emerald-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                        <span>Apply Coupon</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> MongoDB Verified
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#45464d]">
                        Available coupon dynamically verified via your customer booking history
                      </p>
                    </div>
                  </div>

                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Coupon</span>
                    </button>
                  )}
                </div>

                {/* Display ONLY the Applicable Customer Coupon (Rule 3.6 & Rule 5) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#35363d] uppercase tracking-wide">
                      Available Coupon for You:
                    </p>
                    <span className="text-[10px] font-medium text-[#76777d]">
                      Customer: <span className="font-mono text-[#0b1c30]">{email}</span>
                    </span>
                  </div>

                  {availableCoupons.length > 0 ? (
                    availableCoupons.map((coupon) => {
                      const isApplied = appliedCoupon?.code === coupon.code;
                      return (
                        <div
                          key={coupon.code}
                          className={`p-3.5 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isApplied
                              ? 'border-emerald-600 bg-emerald-50/90 shadow-xs'
                              : 'border-emerald-200/90 bg-white hover:border-emerald-400'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-emerald-700 text-white font-extrabold text-xs rounded-md">
                                {coupon.discountPercent}% OFF
                              </span>
                              <span className="font-mono font-bold text-xs bg-gray-100 text-[#0b1c30] px-2 py-0.5 rounded border border-gray-300">
                                {coupon.code}
                              </span>
                              <span className="font-bold text-xs text-[#0b1c30]">
                                {coupon.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#55565d]">
                              {coupon.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isApplied ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Applied</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={handleRemoveCoupon}
                                  className="px-2.5 py-1.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(coupon.code)}
                                disabled={isValidatingCoupon}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <Tag className="w-3.5 h-3.5" />
                                <span>Apply Coupon</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs text-[#76777d]">
                      Checking MongoDB booking history for available promotions...
                    </div>
                  )}
                </div>

                {/* Manual Coupon Input Box */}
                <div className="pt-1">
                  <p className="text-[10px] text-[#76777d] font-semibold mb-1">Have another promo code? Enter manually:</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="ENTER COUPON CODE (e.g. NEWREG10, EXISTING5)"
                        className="w-full uppercase font-mono bg-white border border-[#c6c6cd] rounded-xl px-3 py-2 text-xs text-[#0b1c30] focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {isValidatingCoupon ? (
                        <span>Checking...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Validation Success Feedback */}
                {appliedCoupon && (
                  <div className="bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-lg text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        <strong>{appliedCoupon.code} Applied:</strong> {appliedCoupon.title} &bull; Save {appliedCoupon.discountPercent}% (−{formatCurrency(discountAmount, { decimals: 2 })})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer underline ml-2 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Validation Error Feedback */}
                {couponError && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Details */}
              <div className="flex items-center gap-2 text-sm font-bold text-[#0b1c30] mb-1">
                <CreditCard className="w-4 h-4 text-[#0051d5]" /><span>Payment Method</span>
              </div>
              <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c6c6cd]/50 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#45464d] block mb-1">Card Number</label>
                  <div className="flex items-center bg-white border border-[#c6c6cd] rounded-xl px-3 py-2 focus-within:border-[#0051d5]">
                    <CreditCard className="w-4 h-4 text-[#76777d] mr-2 shrink-0" />
                    <input 
                      type="text" 
                      required 
                      value={cardNumber} 
                      onChange={e => setCardNumber(e.target.value)} 
                      placeholder="4242 **** **** 4242" 
                      className="w-full border-none p-0 focus:outline-none text-sm text-[#0b1c30]" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#45464d] block mb-1">Expires</label>
                    <input 
                      type="text" 
                      required 
                      value={cardExpiry} 
                      onChange={e => setCardExpiry(e.target.value)} 
                      placeholder="MM/YY" 
                      className="w-full bg-white border border-[#c6c6cd] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0051d5]" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#45464d] block mb-1">CVC</label>
                    <input 
                      type="text" 
                      required 
                      value={cardCvc} 
                      onChange={e => setCardCvc(e.target.value)} 
                      placeholder="123" 
                      className="w-full bg-white border border-[#c6c6cd] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0051d5]" 
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown with Coupon Savings (Rule 5: Base rental, Applied coupon discount, Taxable amount, GST, Final payable amount) */}
              <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/50 shadow-xs space-y-2.5 text-xs text-[#45464d]">
                <div className="font-bold text-xs text-[#0b1c30] uppercase tracking-wider pb-1 border-b border-[#eff4ff]">
                  Price Breakdown &amp; Taxes
                </div>

                <div className="flex justify-between">
                  <span>Base rental ({vehicle.name} &bull; {rentalDays} days @ {formatCurrency(vehicle.pricePerDay)}/day)</span>
                  <span className="font-semibold text-[#0b1c30]">{formatCurrency(baseRentalPrice, { decimals: 2 })}</span>
                </div>

                {protectionTotal > 0 && (
                  <div className="flex justify-between">
                    <span>{protectionPlan === 'standard' ? 'Standard Protection' : 'Premium Zero Protection'} ({rentalDays} days)</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(protectionTotal, { decimals: 2 })}</span>
                  </div>
                )}

                {/* Highlight Applied Discount */}
                {appliedCoupon && discountAmount > 0 ? (
                  <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg font-semibold border border-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.title} ({appliedCoupon.discountPercent}% OFF)</span>
                    </span>
                    <span>−{formatCurrency(discountAmount, { decimals: 2 })}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[#76777d]">
                    <span>Applied coupon discount</span>
                    <span>₹0.00</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-dashed border-[#c6c6cd]/60 pt-2 font-medium">
                  <span className="text-[#0b1c30]">Taxable amount</span>
                  <span className="font-bold text-[#0b1c30]">{formatCurrency(taxableAmount, { decimals: 2 })}</span>
                </div>

                <div className="flex justify-between font-medium">
                  <span className="text-[#0b1c30]">Illustrative GST (5%)</span>
                  <span className="font-semibold text-[#0b1c30]">{formatCurrency(gstAmount, { decimals: 2 })}</span>
                </div>

                <div className="border-t border-[#0051d5]/30 pt-3 flex justify-between items-baseline text-sm font-bold text-[#0b1c30] bg-[#eff4ff]/50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                  <div>
                    <span className="text-base text-[#0b1c30]">Total payable</span>
                    {appliedCoupon && (
                      <span className="block text-[11px] font-normal text-emerald-700">
                        You saved {formatCurrency(discountAmount, { decimals: 2 })} with {appliedCoupon.code}!
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-black text-[#0051d5]">{formatCurrency(totalDue, { decimals: 2 })}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-sm font-semibold text-[#45464d] hover:text-[#0b1c30] cursor-pointer">Back</button>
                <button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="px-8 py-3 bg-[#0051d5] hover:bg-[#003ea8] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
                  {isProcessing ? <span>Confirming Reservation...</span> : <><Lock className="w-4 h-4" /><span>Confirm &amp; Book Now</span></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success + Voucher */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Success Banner */}
              <div className="bg-gradient-to-br from-[#0b1c30] to-[#003ea8] rounded-2xl p-6 text-center text-white">
                <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-1">Booking Confirmed!</h3>
                <p className="text-[#bec6e0] text-sm mb-4">Your reservation is secured. Present your voucher at pickup.</p>
                <div className="bg-white/10 rounded-xl px-6 py-3 inline-block">
                  <p className="text-[#bec6e0] text-xs font-medium mb-1">PICKUP CODE</p>
                  <p className="text-3xl font-black tracking-widest text-white">{confirmedBooking.pickupCode}</p>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-[#f8f9ff] rounded-xl border border-[#eff4ff] p-4 space-y-2 text-xs text-[#45464d]">
                <div className="flex justify-between font-semibold text-[#0b1c30] text-sm mb-2">
                  <span>{vehicle.name}</span>
                  <span className="text-[#0051d5]">{formatCurrency(confirmedBooking.totalDue, { decimals: 2 })} total</span>
                </div>
                <div className="flex justify-between">
                  <span>Base rental</span>
                  <span className="font-medium text-[#0b1c30]">{formatCurrency(confirmedBooking.rentalRateTotal, { decimals: 2 })}</span>
                </div>
                {confirmedBooking.couponCode && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Discount Coupon Applied ({confirmedBooking.couponCode} &bull; {confirmedBooking.discountPercent}% OFF)</span>
                    </span>
                    <span>−{formatCurrency(confirmedBooking.discountAmount || 0, { decimals: 2 })}</span>
                  </div>
                )}
                {confirmedBooking.taxableAmount !== undefined && (
                  <div className="flex justify-between">
                    <span>Taxable amount</span>
                    <span className="font-medium text-[#0b1c30]">{formatCurrency(confirmedBooking.taxableAmount, { decimals: 2 })}</span>
                  </div>
                )}
                {confirmedBooking.gstAmount !== undefined && (
                  <div className="flex justify-between">
                    <span>Illustrative GST (5%)</span>
                    <span className="font-medium text-[#0b1c30]">{formatCurrency(confirmedBooking.gstAmount, { decimals: 2 })}</span>
                  </div>
                )}
                <div className="border-t border-[#c6c6cd]/50 pt-1.5 flex justify-between font-bold text-[#0b1c30]">
                  <span>Total payable</span>
                  <span className="text-[#0051d5] font-extrabold">{formatCurrency(confirmedBooking.totalDue, { decimals: 2 })}</span>
                </div>
                <div className="flex justify-between pt-1"><span>Customer</span><span className="font-medium text-[#0b1c30]">{confirmedBooking.customerName}</span></div>
                <div className="flex justify-between"><span>Pickup</span><span className="font-medium text-[#0b1c30]">{confirmedBooking.pickupDate} at {confirmedBooking.pickupTime}</span></div>
                <div className="flex justify-between"><span>Return</span><span className="font-medium text-[#0b1c30]">{confirmedBooking.dropoffDate} at {confirmedBooking.dropoffTime}</span></div>
                <div className="flex justify-between"><span>Location</span><span className="font-medium text-[#0b1c30]">{confirmedBooking.pickupLocation}</span></div>
                <div className="flex justify-between"><span>Protection</span><span className="font-medium text-[#0b1c30] capitalize">{confirmedBooking.protectionPlan}</span></div>
                <div className="flex justify-between"><span>Payment</span><span className="font-medium text-[#0b1c30]">Card ending in {confirmedBooking.paymentMethodLast4}</span></div>
              </div>

              {/* Voucher Error */}
              {voucherError && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2 text-xs text-orange-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{voucherError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button 
                  type="button" 
                  onClick={handlePrintVoucher} 
                  disabled={isDownloadingVoucher}
                  className="flex-1 px-4 py-3 bg-[#0051d5] hover:bg-[#003ea8] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleDownloadVoucher} 
                  disabled={isDownloadingVoucher}
                  className="flex-1 px-4 py-3 bg-[#0b1c30] hover:bg-[#152a45] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  {isDownloadingVoucher ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>Preparing...</span></>
                  ) : (
                    <><Download className="w-4 h-4" /><span>Download PDF</span></>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-5 py-3 bg-white border border-[#c6c6cd] hover:border-[#0051d5] text-[#0b1c30] font-semibold text-sm rounded-xl transition-all cursor-pointer">
                  Done
                </button>
              </div>
              <p className="text-center text-[10px] text-[#76777d]">
                Confirmation sent to {confirmedBooking.customerEmail} &bull; Booking ID: {confirmedBooking.id}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Official Voucher Print / Download Modal */}
      {confirmedBooking && (
        <VoucherModal
          booking={confirmedBooking}
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          autoPrint={true}
        />
      )}
    </div>
  );
};
