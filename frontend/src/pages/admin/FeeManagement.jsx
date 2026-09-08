import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  CreditCard,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  DollarSign
} from 'lucide-react';

export default function FeeManagement() {
  const [studentFees, setStudentFees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFees();
  }, [selectedSession, selectedClass]);

  const fetchInitialData = async () => {
    try {
      const [sessRes, clsRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/sessions/classes/all')
      ]);

      const sess = sessRes.data.sessions || [];
      const cls = clsRes.data.classes || [];

      setSessions(sess);
      setClasses(cls);

      const activeS = sess.find(s => s.isActive) || sess[0];
      if (activeS) setSelectedSession(activeS._id);
    } catch (err) {
      console.error('Failed to load sessions/classes:', err);
    }
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      let query = '';
      if (selectedSession) query += `?sessionId=${selectedSession}`;
      if (selectedClass) query += `${query ? '&' : '?'}classId=${selectedClass}`;

      const res = await api.get(`/fees${query}`);
      if (res.data.success) {
        setStudentFees(res.data.studentFees || []);
      }
    } catch (err) {
      console.error('Failed to fetch fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTotalAmount(item.fee.totalAmount || 5000);
    setPaidAmount(item.fee.paidAmount || 0);
    setRemarks(item.fee.remarks || '');
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    if (!editingItem || !selectedSession) return;
    setSaving(true);

    try {
      const res = await api.post('/fees', {
        studentId: editingItem.student._id,
        sessionId: selectedSession,
        totalAmount,
        paidAmount,
        remarks
      });

      if (res.data.success) {
        setMsg(`Fee record updated for ${editingItem.student.name}`);
        setEditingItem(null);
        setTimeout(() => setMsg(''), 3500);
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update fee record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-cyan-400" /> Student Fee Accounting & Ledgers
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Maintain student tuition fees, update paid amounts, and track balance pending fees per academic session.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {msg}
        </div>
      )}

      {/* Selectors */}
      <div className="glass-panel p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Academic Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2 outline-none font-semibold"
            >
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.yearLabel} {s.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Filter by Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2 outline-none font-semibold"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.section}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Student</th>
                <th className="p-4">Total Tuition Fee</th>
                <th className="p-4">Submitted (Paid)</th>
                <th className="p-4">Pending Balance</th>
                <th className="p-4">Status & Remarks</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">Loading fee ledgers...</td>
                </tr>
              ) : studentFees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No student fee records found.</td>
                </tr>
              ) : (
                studentFees.map((item) => {
                  const total = item.fee.totalAmount || 0;
                  const paid = item.fee.paidAmount || 0;
                  const pending = item.fee.pendingAmount !== undefined ? item.fee.pendingAmount : Math.max(0, total - paid);

                  return (
                    <tr key={item.student._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{item.student.name}</div>
                        <div className="text-3xs text-slate-400">Roll: {item.student.rollNumber || 'N/A'}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-200">${total.toLocaleString()}</td>
                      <td className="p-4 font-bold text-emerald-400">${paid.toLocaleString()}</td>
                      <td className="p-4 font-bold text-rose-400">${pending.toLocaleString()}</td>
                      <td className="p-4">
                        {pending === 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                            Paid In Full
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                            Pending Balance
                          </span>
                        )}
                        {item.fee.remarks && (
                          <p className="text-3xs text-slate-400 mt-1 truncate max-w-[200px]">{item.fee.remarks}</p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-3xs flex items-center gap-1 ml-auto transition-all shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5" /> Update Fee Record
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Update Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-slate-800 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" /> Fee Accounting - {editingItem.student.name}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Fee Amount ($)</label>
                <input
                  type="number"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Submitted / Paid Amount ($)</label>
                <input
                  type="number"
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-emerald-400 font-bold outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Auto-Computed Pending:</span>
                <span className="font-black text-rose-400 text-sm">
                  ${Math.max(0, Number(totalAmount || 0) - Number(paidAmount || 0)).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Remarks</label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Installment details, payment mode, due dates..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {saving ? 'Saving...' : 'Save & Publish Fee Ledgers'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
