import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animatePageEntrance } from '../utils/animations';
import {
  School,
  UserCheck,
  ShieldCheck,
  Lock,
  Mail,
  Building,
  User,
  BadgeAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'student' ? 'student' : 'admin';

  const [activeTab, setActiveTab] = useState(initialRole); // 'admin' | 'student'
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const [isStudentRegister, setIsStudentRegister] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institutionName, setInstitutionName] = useState('Greenwood International Academy');
  const [adminRole, setAdminRole] = useState('Principal');
  const [rollNumber, setRollNumber] = useState('');

  // Status state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { loginAdmin, registerAdmin, loginStudent, registerStudentRequest, user } = useAuth();

  useEffect(() => {
    animatePageEntrance(containerRef.current);
  }, [activeTab, isAdminRegister, isStudentRegister]);

  useEffect(() => {
    if (user) {
      if (user.userType === 'admin') navigate('/admin');
      else if (user.userType === 'student') navigate('/student');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        if (isAdminRegister) {
          const data = await registerAdmin({
            institutionName,
            name,
            email,
            password,
            role: adminRole
          });
          if (data.success) {
            navigate('/admin');
          }
        } else {
          const data = await loginAdmin(email, password);
          if (data.success) {
            navigate('/admin');
          }
        }
      } else {
        // Student Flow
        if (isStudentRegister) {
          const data = await registerStudentRequest({
            name,
            email,
            password,
            institutionName,
            rollNumber
          });
          if (data.success) {
            setSuccessMsg(data.message);
            setIsStudentRegister(false);
          }
        } else {
          const data = await loginStudent(email, password, institutionName);
          if (data.success) {
            navigate('/student');
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-xl glow-indigo">
          <School className="w-7 h-7 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-2xl tracking-tight text-white">CBSERP Portal</span>
          <span className="text-xs block text-slate-400 font-medium">Institution Login & Authentication</span>
        </div>
      </Link>

      {/* Main Container */}
      <div ref={containerRef} className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl z-10 border border-slate-800">
        
        {/* Tab Selector */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'student'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Student Portal
          </button>
        </div>

        {/* Alert Banners */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <BadgeAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Error</p>
              <p className="text-xs text-rose-200/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Request Submitted</p>
              <p className="text-xs text-emerald-200/80 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Form Title */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white">
            {activeTab === 'admin'
              ? isAdminRegister
                ? 'Register Admin Account'
                : 'Admin Sign-In'
              : isStudentRegister
              ? 'Request Student Account Access'
              : 'Student Sign-In'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'admin'
              ? 'Access institution controls, students ERP, sessions & remarks.'
              : 'Enter your credentials & verified institution name.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Registration Fields */}
          {activeTab === 'admin' && isAdminRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institution Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Greenwood International Academy"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Arthur Pendelton"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Role <span className="text-indigo-400 text-xs font-normal">(Editable in Profile later)</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  placeholder="Principal / Academic Head / Registrar"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </>
          )}

          {/* Student Specific Fields */}
          {activeTab === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institution Name <span className="text-amber-400 text-xs">(Verification Check)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Greenwood International Academy"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'student' && isStudentRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Student Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Roll Number (Optional)</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 1001"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </>
          )}

          {/* Email & Password (Common) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'admin' ? 'admin@greenwood.edu' : 'alex.smith@student.com'}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {activeTab === 'admin'
                  ? isAdminRegister ? 'Create Admin Account' : 'Sign In as Admin'
                  : isStudentRegister ? 'Submit Request to Admin' : 'Verify & Enter Portal'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Form Mode */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          {activeTab === 'admin' ? (
            <button
              onClick={() => setIsAdminRegister(!isAdminRegister)}
              className="text-indigo-400 font-semibold hover:underline"
            >
              {isAdminRegister ? 'Already have an admin account? Sign In' : 'Register new Admin & Institution'}
            </button>
          ) : (
            <button
              onClick={() => setIsStudentRegister(!isStudentRegister)}
              className="text-indigo-400 font-semibold hover:underline"
            >
              {isStudentRegister ? 'Already registered? Sign In' : 'New student? Request Access Approval'}
            </button>
          )}
        </div>

        {/* Demo Hint */}
        <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-2xs text-slate-400 text-center">
          💡 Demo Credentials: <br />
          <span className="text-indigo-300">Admin:</span> admin@greenwood.edu / admin123 <br />
          <span className="text-purple-300">Student:</span> alex.smith@student.com / student123 <br />
          <span className="text-slate-400 font-medium">Institution:</span> Greenwood International Academy
        </div>
      </div>
    </div>
  );
}
