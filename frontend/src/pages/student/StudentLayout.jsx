import React, { useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { animatePageEntrance } from '../../utils/animations';
import {
  School,
  LayoutDashboard,
  ClipboardCheck,
  CreditCard,
  Bell,
  Award,
  LogOut,
  ChevronRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    animatePageEntrance(contentRef.current);
  }, [location.pathname]);

  if (!user || user.userType !== 'student') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 text-xs mt-2 mb-6">
          Student authority verification required. Log in with your email, password, and institution name.
        </p>
        <button
          onClick={() => navigate('/login?role=student')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all"
        >
          Go to Student Login
        </button>
      </div>
    );
  }

  const navItems = [
    { label: 'Student Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'Attendance Remarks & %', path: '/student/attendance', icon: ClipboardCheck },
    { label: 'Submitted & Pending Fees', path: '/student/fees', icon: CreditCard },
    { label: 'PDF Announcements', path: '/student/announcements', icon: Bell },
    { label: 'My Exam Results', path: '/student/results', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between p-5 shrink-0 z-20">
        <div>
          {/* Logo Brand */}
          <Link to="/student" className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-md glow-indigo">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block">CBSERP Student</span>
              <span className="text-3xs text-emerald-400 font-semibold uppercase tracking-wider">Verified Account</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md glow-indigo'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Badge */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-extrabold text-white text-xs">
              {user.name ? user.name[0] : 'S'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
              <span className="text-3xs text-emerald-400 font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Admin Approved
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login?role=student');
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar */}
        <header className="px-8 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-10">
          <div>
            <span className="text-xs font-bold text-slate-400">Enrolled Institution</span>
            <h2 className="text-lg font-black text-white">{user.institution?.name || 'Greenwood International Academy'}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Student Permission Verified
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main ref={contentRef} className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
