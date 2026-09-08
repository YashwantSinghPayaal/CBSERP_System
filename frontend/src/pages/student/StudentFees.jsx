import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CreditCard, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentFees() {
  const [fee, setFee] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    remarks: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees/my-fee');
      if (res.data.success) {
        setFee(res.data.fee || {});
      }
    } catch (err) {
      console.error('Failed to fetch student fee details:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = fee.totalAmount || 0;
  const paid = fee.paidAmount || 0;
  const pending = fee.pendingAmount !== undefined ? fee.pendingAmount : Math.max(0, total - paid);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-cyan-400" /> Submitted & Pending Tuition Fees
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          View your submitted tuition fee details, remaining pending balance, and payment notes maintained by your institution admin.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Annual Tuition Fee</span>
          <div className="text-4xl font-black text-white">${total.toLocaleString()}</div>
          <span className="text-3xs text-slate-500 block">Assigned structure for session</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2 border-emerald-500/30">
          <span className="text-xs font-semibold text-emerald-300">Submitted (Paid Amount)</span>
          <div className="text-4xl font-black text-emerald-400">${paid.toLocaleString()}</div>
          <span className="text-3xs text-emerald-300/80 block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Successfully processed
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2 border-rose-500/30">
          <span className="text-xs font-semibold text-rose-300">Pending Balance Fee</span>
          <div className="text-4xl font-black text-rose-400">${pending.toLocaleString()}</div>
          <span className="text-3xs text-rose-300/80 block">
            {pending === 0 ? 'No outstanding dues' : 'Balance payable'}
          </span>
        </div>
      </div>

      {/* Detailed Ledger Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-white text-sm pb-3 border-b border-slate-800 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" /> Payment Remarks & Admin Notes
        </h3>

        {loading ? (
          <p className="text-slate-500 text-xs py-4">Loading fee ledger...</p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Payment Status:</span>
                {pending === 0 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Tuition Paid in Full
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                    Pending Balance Due
                  </span>
                )}
              </div>

              {fee.updatedByAdmin && (
                <div className="text-3xs text-slate-500 pt-1 border-t border-slate-800">
                  Last updated by: {fee.updatedByAdmin.name} ({fee.updatedByAdmin.role})
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-1">Remarks & Instructions:</h4>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                {fee.remarks || 'No payment remarks attached yet by admin.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
