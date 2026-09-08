import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail, Building, CheckCircle2, Edit3, Users } from 'lucide-react';

export default function AdminProfile() {
  const { user, updateAdminProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'Administrator');
  const [team, setTeam] = useState([]);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTeamAdmins();
  }, []);

  const fetchTeamAdmins = async () => {
    try {
      const res = await api.get('/auth/admin/team');
      if (res.data.success) {
        setTeam(res.data.admins);
      }
    } catch (err) {
      console.error('Failed to fetch admin team:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await updateAdminProfile({ name, role });
      if (res.success) {
        setSuccessMsg('Your Admin profile & role have been updated successfully!');
        fetchTeamAdmins();
      } else {
        setErrorMsg(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <User className="w-7 h-7 text-indigo-400" /> Admin Profile & Role Management
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          As an Institution Admin, you can edit your name and custom administrative role anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Edit Card */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg glow-indigo">
              {name ? name[0] : 'A'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{name}</h2>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold inline-block mt-1">
                {role}
              </span>
            </div>
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institution Name</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  disabled
                  value={user?.institution?.name || 'Greenwood International Academy'}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-300 mb-1.5 flex items-center justify-between">
                <span>Custom Admin Role</span>
                <span className="text-3xs text-slate-400 font-normal">Editable anytime</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Principal, Vice Principal, Head of Academics, Registrar"
                className="w-full bg-slate-900 border border-indigo-500/50 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white font-medium outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Save Profile & Update Role
                </>
              )}
            </button>
          </form>
        </div>

        {/* Institution Admin Team Members */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Users className="w-4 h-4 text-purple-400" /> Institution Admins ({team.length})
          </h3>

          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {team.map((adm) => (
              <div key={adm._id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                  {adm.name ? adm.name[0] : 'A'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate">{adm.name}</h4>
                  <span className="text-3xs text-indigo-400 block truncate">{adm.role || 'Admin'}</span>
                  <span className="text-3xs text-slate-500 block truncate">{adm.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
