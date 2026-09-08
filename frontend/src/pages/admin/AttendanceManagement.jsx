import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  ClipboardCheck,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Check
} from 'lucide-react';

export default function AttendanceManagement() {
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [studentRows, setStudentRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchInitialMetaData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassAttendance();
    }
  }, [selectedClass, date]);

  const fetchInitialMetaData = async () => {
    try {
      const [clsRes, sessRes] = await Promise.all([
        api.get('/sessions/classes/all'),
        api.get('/sessions')
      ]);

      const cls = clsRes.data.classes || [];
      const sess = sessRes.data.sessions || [];

      setClasses(cls);
      setSessions(sess);

      if (cls.length > 0) setSelectedClass(cls[0]._id);
      const activeS = sess.find(s => s.isActive) || sess[0];
      if (activeS) setSelectedSession(activeS._id);
    } catch (err) {
      console.error('Failed to load classes for attendance:', err);
    }
  };

  const fetchClassAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/class?classId=${selectedClass}&date=${date}`);
      if (res.data.success) {
        setStudentRows(res.data.students || []);
      }
    } catch (err) {
      console.error('Failed to load class attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudentRows(prev =>
      prev.map(row => (row.student.id === studentId ? { ...row, todayStatus: status } : row))
    );
  };

  const handleRemarkChange = (studentId, remark) => {
    setStudentRows(prev =>
      prev.map(row => (row.student.id === studentId ? { ...row, todayRemark: remark } : row))
    );
  };

  const handleMarkAll = (status) => {
    setStudentRows(prev => prev.map(row => ({ ...row, todayStatus: status })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSession) return;
    setSaving(true);
    setMsg('');

    try {
      const records = studentRows.map(row => ({
        studentId: row.student.id,
        status: row.todayStatus,
        remark: row.todayRemark || ''
      }));

      const res = await api.post('/attendance', {
        classId: selectedClass,
        sessionId: selectedSession,
        date,
        records
      });

      if (res.data.success) {
        setMsg('Class attendance & remarks saved successfully! Student percentages updated.');
        setTimeout(() => setMsg(''), 4000);
        fetchClassAttendance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <ClipboardCheck className="w-7 h-7 text-emerald-400" /> Attendance & Presence Percentage Register
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Maintain daily class roll call and attendance remarks. System computes presence percentage automatically.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || studentRows.length === 0}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Roll Call & Remarks
            </>
          )}
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {msg}
        </div>
      )}

      {/* Selectors Bar */}
      <div className="glass-panel p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Select Class & Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-3.5 py-2 outline-none font-semibold"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-3.5 py-2 outline-none font-semibold"
            />
          </div>
        </div>

        {/* Quick Mark All Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Mark All As:</span>
          <button
            onClick={() => handleMarkAll('Present')}
            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg font-bold transition-all"
          >
            Present
          </button>
          <button
            onClick={() => handleMarkAll('Absent')}
            className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg font-bold transition-all"
          >
            Absent
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Student</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Overall Presence %</th>
                <th className="p-4">Today's Status</th>
                <th className="p-4">Admin Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading student roll call...</td>
                </tr>
              ) : studentRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No students enrolled in this class.</td>
                </tr>
              ) : (
                studentRows.map((row) => (
                  <tr key={row.student.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{row.student.name}</div>
                      <div className="text-3xs text-slate-400">{row.student.email}</div>
                    </td>
                    <td className="p-4 font-mono text-indigo-300 font-semibold">{row.student.rollNumber || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.percentage >= 85
                                ? 'bg-emerald-500'
                                : row.percentage >= 70
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, row.percentage)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-white text-xs">{row.percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {['Present', 'Absent', 'Late'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(row.student.id, st)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-3xs transition-all ${
                              row.todayStatus === st
                                ? st === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : st === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-md'
                                  : 'bg-amber-600 text-white shadow-md'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={row.todayRemark || ''}
                        onChange={(e) => handleRemarkChange(row.student.id, e.target.value)}
                        placeholder="Add remark..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
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
