import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { animateCountUp, animateStaggerList } from '../../utils/animations';
import {
  ClipboardCheck,
  CreditCard,
  Bell,
  Award,
  ArrowUpRight,
  Sparkles,
  School,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attPercentage, setAttPercentage] = useState(100);
  const [feeInfo, setFeeInfo] = useState({ totalAmount: 0, paidAmount: 0, pendingAmount: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const percentageCountRef = useRef(null);
  const pendingFeeCountRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchStudentSummary();
  }, []);

  const fetchStudentSummary = async () => {
    try {
      setLoading(true);
      const [attRes, feeRes, annRes, resRes] = await Promise.all([
        api.get('/attendance/my-attendance'),
        api.get('/fees/my-fee'),
        api.get('/announcements'),
        api.get('/results/my-results')
      ]);

      const pct = attRes.data.summary?.percentage || 100;
      const fee = feeRes.data.fee || { totalAmount: 0, paidAmount: 0, pendingAmount: 0 };
      const anns = annRes.data.announcements || [];
      const results = resRes.data.results || [];

      setAttPercentage(pct);
      setFeeInfo(fee);
      setAnnouncements(anns.slice(0, 3));
      if (results.length > 0) setLatestResult(results[0]);

      setTimeout(() => {
        animateCountUp(percentageCountRef, pct);
        animateCountUp(pendingFeeCountRef, fee.pendingAmount || 0);
        animateStaggerList(containerRef);
      }, 100);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
            Student Portal
          </span>
          <h1 className="text-3xl font-black text-white">
            Welcome, {user.name} 👋
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Institution: <span className="text-indigo-300 font-semibold">{user.institution?.name}</span>
            {user.rollNumber && <span> | Roll No: <strong className="text-emerald-400">{user.rollNumber}</strong></span>}
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-item glass-card p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">Total Attendance %</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline text-3xl font-black text-white">
            <span ref={percentageCountRef}>100</span>
            <span className="text-lg text-emerald-400 font-bold ml-1">%</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Maintained by admin roll call</span>
        </div>

        <div className="animate-item glass-card p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">Pending Balance Fee</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline text-3xl font-black text-rose-400">
            <span>$</span>
            <span ref={pendingFeeCountRef}>0</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            Submitted: <strong className="text-emerald-400">${feeInfo.paidAmount?.toLocaleString()}</strong>
          </span>
        </div>

        <div className="animate-item glass-card p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">PDF Circulars</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{announcements.length}</div>
          <span className="text-xs text-slate-400 mt-2 block">Active notices available</span>
        </div>

        <div className="animate-item glass-card p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">Latest Exam Result</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300">
            {latestResult ? `${latestResult.percentage}%` : 'N/A'}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            {latestResult ? latestResult.examName : 'No exam published yet'}
          </span>
        </div>
      </div>

      {/* Navigation Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" /> Recent PDF Announcements
            </h3>
            <Link to="/student/announcements" className="text-xs font-bold text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">No recent announcements.</p>
            ) : (
              announcements.map(ann => (
                <div key={ann._id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{ann.title}</h4>
                    <span className="text-3xs text-slate-400">{new Date(ann.postedOn || ann.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ann.pdfUrl && (
                    <a
                      href={ann.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg text-3xs font-bold transition-all flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> PDF
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Student Portal Links
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/student/attendance"
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
            >
              <ClipboardCheck className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  Attendance <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </h4>
                <p className="text-3xs text-slate-400 mt-1">View presence logs</p>
              </div>
            </Link>

            <Link
              to="/student/fees"
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col justify-between group"
            >
              <CreditCard className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  Fee Status <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </h4>
                <p className="text-3xs text-slate-400 mt-1">Paid vs Pending</p>
              </div>
            </Link>

            <Link
              to="/student/announcements"
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between group"
            >
              <Bell className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  Circulars <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </h4>
                <p className="text-3xs text-slate-400 mt-1">Download PDF circulars</p>
              </div>
            </Link>

            <Link
              to="/student/results"
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
            >
              <Award className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  Report Cards <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </h4>
                <p className="text-3xs text-slate-400 mt-1">View personal marks</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
