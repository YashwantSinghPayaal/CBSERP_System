import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  ShieldCheck,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  FileText,
  CreditCard,
  Award,
  ArrowRight,
  Sparkles,
  School
} from 'lucide-react';
import { animateCardHover } from '../utils/animations';

export default function LandingPage() {
  const heroRef = useRef(null);
  const cardsContainerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero stagger entrance
      gsap.fromTo(
        '.hero-anim',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );

      // Feature cards reveal
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.2)',
          delay: 0.4
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: ShieldCheck,
      color: 'from-blue-500 to-indigo-600',
      title: 'Multi-Admin & Custom Roles',
      desc: 'Multiple admins per institution. Specify role during sign-up (Principal, Registrar, Coordinator) and modify roles anytime in profile settings.'
    },
    {
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      title: 'Institution-Gated Student Login',
      desc: 'Students sign in with Email, Password, & Institution Name. Access granted ONLY after an admin approves the account.'
    },
    {
      icon: Calendar,
      color: 'from-amber-500 to-orange-600',
      title: 'Session Management & Class Clearing',
      desc: 'Create academic sessions. At session end, admins can clear class rosters for a fresh term while preserving historical archives.'
    },
    {
      icon: FileSpreadsheet,
      color: 'from-violet-500 to-purple-600',
      title: 'Attendance & Presence Percentage',
      desc: 'Admins log daily roll calls. System automatically computes overall presence percentages for student transparency.'
    },
    {
      icon: FileText,
      color: 'from-rose-500 to-pink-600',
      title: 'PDF Announcement Portal',
      desc: 'Upload official school circulars and PDF announcements with Multer file management for students to view & download.'
    },
    {
      icon: CreditCard,
      color: 'from-cyan-500 to-blue-600',
      title: 'Fee Accounting (Paid / Pending)',
      desc: 'Admins maintain total, paid, and balance pending fees per session. Students track their financial status effortlessly.'
    },
    {
      icon: Award,
      color: 'from-fuchsia-500 to-purple-600',
      title: 'Exam Result & Report Card PDF',
      desc: 'Admin uploads term marks breakdown or PDF report cards per student for personal student portal access.'
    }
  ];

  return (
    <div ref={heroRef} className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Header Navigation */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg glow-indigo">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
              CBSERP
            </span>
            <span className="text-xs block text-slate-400 font-medium">Institution Enterprise System</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login?role=student"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Student Portal
          </Link>
          <Link
            to="/login?role=admin"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            Admin Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20 z-10 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="hero-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            GSAP Animated & JWT Auth Secured Enterprise ERP
          </div>

          <h1 className="hero-anim text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Next-Gen School Management & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Student ERP System</span>
          </h1>

          <p className="hero-anim text-slate-400 text-lg leading-relaxed font-normal">
            A real-world ready institution management portal. Admin role flexibility, institution-gated student verification, session rollover, auto attendance computation, PDF announcements, fee management, & exam report cards.
          </p>

          <div className="hero-anim pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login?role=admin"
              className="px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              Access Admin Console <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login?role=student"
              className="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl transition-all"
            >
              Student Portal Access
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div ref={cardsContainerRef} className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              onMouseEnter={(e) => animateCardHover(e, true)}
              onMouseLeave={(e) => animateCardHover(e, false)}
              className="feature-card glass-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center shadow-lg mb-5`}>
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-slate-500 text-sm z-10 bg-slate-950/80 backdrop-blur-md">
        <p>© 2026 CBSERP System - School Enterprise Resource Planning. Built with MERN & GSAP.</p>
      </footer>
    </div>
  );
}
