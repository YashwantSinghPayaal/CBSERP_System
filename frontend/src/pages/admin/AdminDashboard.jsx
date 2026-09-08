import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { animateCountUp, animateStaggerList } from '../../utils/animations';
import {
  Users,
  UserCheck,
  Bell,
  CreditCard,
  Calendar,
  ArrowUpRight,
  UserPlus,
  PlusCircle,
  Megaphone,
  Award
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    totalAnnouncements: 0,
    activeSession: 'Loading...',
    totalFeesCollected: 0
  });
  const [loading, setLoading] = useState(true);

  const studentsCountRef = useRef(null);
  const pendingCountRef = useRef(null);
  const announcementsCountRef = useRef(null);
  const feesCountRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, annRes, sessionRes, feesRes] = await Promise.all([
        api.get('/students'),
        api.get('/announcements'),
        api.get('/sessions'),
        api.get('/fees')
      ]);

      const allStudents = studentsRes.data.students || [];
      const pending = allStudents.filter(s => s.status === 'pending').length;
      const announcements = annRes.data.announcements || [];
      const sessions = sessionRes.data.sessions || [];
      const activeSess = sessions.find(s => s.isActive)?.yearLabel || '2025-2026';

      const studentFees = feesRes.data.studentFees || [];
      const totalPaid = studentFees.reduce((acc, curr) => acc + (curr.fee?.paidAmount || 0), 0);

      setStats({
        totalStudents: allStudents.length,
        pendingApprovals: pending,
        totalAnnouncements: announcements.length,
        activeSession: activeSess,
        totalFeesCollected: totalPaid
      });

      // Animate GSAP Count up numbers
      setTimeout(() => {
        animateCountUp(studentsCountRef, allStudents.length);
        animateCountUp(pendingCountRef, pending);
        animateCountUp(announcementsCountRef, announcements.length);
        animateCountUp(feesCountRef, totalPaid);
        animateStaggerList(containerRef);
      }, 100);

    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
            {user.role || 'Administrator Console'}
          </span>
          <h1 className="text-3xl font-black text-white">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            You are managing <span className="text-indigo-300 font-semibold">{user.institution?.name}</span>. You can manage student records, update fees, post PDF circulars, and configure academic sessions.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-item glass-card p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">Total Enrolled Students</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div ref={studentsCountRef} className="text-3xl font-black text-white">0</div>
          <span className="text-xs text-slate-400 mt-2 block">Across all active classes</span>
        </div>

        <div className="animate-item glass-card p-6 rounded-2xl relative border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-amber-300">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div ref={pendingCountRef} className="text-3xl font-black text-amber-300">0</div>
          <span className="text-xs text-slate-400 mt-2 block">Require admin sign-off</span>
        </div>

        <div className="animate-item glass-card p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">PDF Announcements</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div ref={announcementsCountRef} className="text-3xl font-black text-white">0</div>
          <span className="text-xs text-slate-400 mt-2 block">Published circulars</span>
        </div>

        <div className="animate-item glass-card p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">Total Fees Collected</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline text-3xl font-black text-white">
            <span>$</span>
            <span ref={feesCountRef}>0</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Active session accounting</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-400" /> Administrative Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/students"
            className="animate-item glass-card p-5 rounded-2xl hover:border-indigo-500/50 flex flex-col justify-between group"
          >
            <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm flex items-center justify-between">
                Manage & Approve Students <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">Review student registrations & assign classes.</p>
            </div>
          </Link>

          <Link
            to="/admin/attendance"
            className="animate-item glass-card p-5 rounded-2xl hover:border-indigo-500/50 flex flex-col justify-between group"
          >
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm flex items-center justify-between">
                Mark Daily Roll Call <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">Update presence records & computed percentages.</p>
            </div>
          </Link>

          <Link
            to="/admin/announcements"
            className="animate-item glass-card p-5 rounded-2xl hover:border-indigo-500/50 flex flex-col justify-between group"
          >
            <div className="p-3 w-fit rounded-xl bg-rose-500/10 text-rose-400 mb-3 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm flex items-center justify-between">
                Post PDF Circular <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">Upload official PDF announcements for students.</p>
            </div>
          </Link>

          <Link
            to="/admin/results"
            className="animate-item glass-card p-5 rounded-2xl hover:border-indigo-500/50 flex flex-col justify-between group"
          >
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm flex items-center justify-between">
                Upload Exam Report Cards <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">Publish student exam scores and PDF results.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
