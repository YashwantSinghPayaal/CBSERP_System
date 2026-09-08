import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  School,
  Sparkles,
  ArrowRight,
  Archive
} from 'lucide-react';

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);

  // Form states
  const [newYearLabel, setNewYearLabel] = useState('');
  const [makeActive, setMakeActive] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [newSection, setNewSection] = useState('A');
  const [selectedSessionForClass, setSelectedSessionForClass] = useState('');

  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionsAndClasses();
  }, []);

  const fetchSessionsAndClasses = async () => {
    try {
      setLoading(true);
      const [sessRes, classRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/sessions/classes/all')
      ]);

      setSessions(sessRes.data.sessions || []);
      setClasses(classRes.data.classes || []);

      if (sessRes.data.sessions?.length > 0 && !selectedSessionForClass) {
        setSelectedSessionForClass(sessRes.data.sessions[0]._id);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newYearLabel) return;

    try {
      const res = await api.post('/sessions', {
        yearLabel: newYearLabel,
        makeActive
      });

      if (res.data.success) {
        setMsg(`Created session ${newYearLabel}`);
        setNewYearLabel('');
        setTimeout(() => setMsg(''), 3500);
        fetchSessionsAndClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating session');
    }
  };

  const handleActivateSession = async (sessionId) => {
    try {
      const res = await api.patch(`/sessions/${sessionId}/activate`);
      if (res.data.success) {
        setMsg(`Session set as Active`);
        setTimeout(() => setMsg(''), 3500);
        fetchSessionsAndClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate session');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName || !selectedSessionForClass) return;

    try {
      const res = await api.post('/sessions/classes', {
        className: newClassName,
        section: newSection,
        sessionId: selectedSessionForClass
      });

      if (res.data.success) {
        setMsg(`Created ${newClassName}-${newSection}`);
        setNewClassName('');
        setTimeout(() => setMsg(''), 3500);
        fetchSessionsAndClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating class');
    }
  };

  const handleClearClassSession = async (classId, className, section) => {
    if (!window.confirm(`Are you sure you want to clear student class data for ${className}-${section} at session end? Students will be unassigned to prepare for the new session roster while historical attendance/fees/results remain safely archived.`)) {
      return;
    }

    try {
      const res = await api.post(`/sessions/classes/${classId}/clear-session`);
      if (res.data.success) {
        setMsg(res.data.message);
        setTimeout(() => setMsg(''), 4000);
        fetchSessionsAndClasses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear class data');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-indigo-400" /> Academic Session & Class Data Clearing
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Manage school academic sessions. At session end, clear class rosters for a new session while preserving historical records.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {msg}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Academic Session Manager */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Create Academic Session
          </h2>

          <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Session Year Label</label>
              <input
                type="text"
                required
                value={newYearLabel}
                onChange={(e) => setNewYearLabel(e.target.value)}
                placeholder="e.g. 2026-2027"
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white outline-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
              />
              <span>Set as current Active Session</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Add New Academic Session
            </button>
          </form>

          {/* Session List */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configured Sessions</h3>
            {sessions.map((sess) => (
              <div
                key={sess._id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  sess.isActive
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{sess.yearLabel}</div>
                  <span className="text-3xs text-slate-400">Created: {new Date(sess.createdAt).toLocaleDateString()}</span>
                </div>

                {sess.isActive ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-3xs font-extrabold border border-emerald-500/30">
                    Active Session
                  </span>
                ) : (
                  <button
                    onClick={() => handleActivateSession(sess._id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-3xs font-semibold rounded-lg transition-all"
                  >
                    Set Active
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Classes & Class Clearing Section */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <School className="w-4 h-4 text-purple-400" /> Class Roster & End-of-Session Clear
          </h2>

          <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Class 10"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Section</label>
                <input
                  type="text"
                  required
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="A"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Academic Session</label>
              <select
                value={selectedSessionForClass}
                onChange={(e) => setSelectedSessionForClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none"
              >
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.yearLabel} {s.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Create Class & Section
            </button>
          </form>

          {/* Class Clear Action List */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Classes List & End-of-Session Clear</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {classes.map((cls) => (
                <div key={cls._id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{cls.className} - Section {cls.section}</h4>
                    <span className="text-3xs text-slate-400">Session: {cls.session?.yearLabel || 'Default'}</span>
                  </div>

                  <button
                    onClick={() => handleClearClassSession(cls._id, cls.className, cls.section)}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/20 text-3xs font-semibold rounded-lg transition-all flex items-center gap-1"
                  >
                    <Archive className="w-3.5 h-3.5" /> Clear Class Data (Session End)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
