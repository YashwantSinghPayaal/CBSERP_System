import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

export default function StudentAttendance() {
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    percentage: 100
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/my-attendance');
      if (res.data.success) {
        setSummary(res.data.summary || {});
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <ClipboardCheck className="w-7 h-7 text-emerald-400" /> Attendance Register & Total Percentage
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          View your daily attendance logs, teacher remarks, and cumulative presence percentage. (Maintained by Admin)
        </p>
      </div>

      {/* Percentage Gauge Banner */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Presence Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-white">{summary.percentage}%</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                summary.percentage >= 85
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {summary.percentage >= 85 ? 'Excellent Attendance' : 'Attendance Warning'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-2xl font-black text-emerald-400 block">{summary.presentCount}</span>
              <span className="text-3xs font-bold text-slate-400 uppercase">Days Present</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-2xl font-black text-amber-400 block">{summary.lateCount}</span>
              <span className="text-3xs font-bold text-slate-400 uppercase">Days Late</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-2xl font-black text-rose-400 block">{summary.absentCount}</span>
              <span className="text-3xs font-bold text-slate-400 uppercase">Days Absent</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
              style={{ width: `${Math.min(100, summary.percentage)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Daily Attendance Logs & Remarks
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Date</th>
                <th className="p-4">Class & Session</th>
                <th className="p-4">Status</th>
                <th className="p-4">Teacher Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">Loading attendance log...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No attendance logs registered yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-slate-300">
                      {log.class?.className || 'Class'} ({log.session?.yearLabel || 'Active Session'})
                    </td>
                    <td className="p-4">
                      {log.status === 'Present' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Present
                        </span>
                      )}
                      {log.status === 'Absent' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Absent
                        </span>
                      )}
                      {log.status === 'Late' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Late
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 italic">
                      {log.remark || 'Regular attendance recorded'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
