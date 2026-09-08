import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  PlusCircle,
  X
} from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for adding student
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, clRes] = await Promise.all([
        api.get(`/students${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`),
        api.get('/sessions/classes/all')
      ]);

      setStudents(stRes.data.students || []);
      setClasses(clRes.data.classes || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      const res = await api.patch(`/students/${studentId}/status`, { status: newStatus });
      if (res.data.success) {
        setActionMsg(`Student ${newStatus === 'approved' ? 'Approved & Granted System Access' : 'Access Rejected'}`);
        setTimeout(() => setActionMsg(''), 3000);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student status');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/students', {
        name,
        email,
        password,
        rollNumber,
        classId: selectedClass || null,
        status: 'approved'
      });

      if (res.data.success) {
        setShowAddModal(false);
        setName('');
        setEmail('');
        setPassword('');
        setRollNumber('');
        setSelectedClass('');
        setActionMsg('New student registered & approved!');
        setTimeout(() => setActionMsg(''), 3000);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student');
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNumber && s.rollNumber.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-400" /> Student ERP & Access Authorization
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Review student registrations, grant/revoke login authority, and assign classes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 w-fit"
        >
          <UserPlus className="w-4 h-4" /> Add & Approve New Student
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {actionMsg}
        </div>
      )}

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, or roll no..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          {['all', 'pending', 'approved', 'rejected'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Student Info</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Assigned Class</th>
                <th className="p-4">Access Status</th>
                <th className="p-4 text-right">Admin Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading student directory...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No student records found.</td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                          {st.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white">{st.name}</div>
                          <div className="text-3xs text-slate-400">{st.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-indigo-300 font-semibold">{st.rollNumber || 'N/A'}</td>
                    <td className="p-4">
                      {st.currentClass ? (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-semibold">
                          {st.currentClass.className} - {st.currentClass.section}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      {st.status === 'approved' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Granted
                        </span>
                      )}
                      {st.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending Admin Sign-Off
                        </span>
                      )}
                      {st.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Access Denied
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {st.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(st._id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-3xs flex items-center gap-1 transition-all shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Grant Access
                          </button>
                        )}
                        {st.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(st._id, 'rejected')}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg font-semibold text-3xs flex items-center gap-1 transition-all"
                          >
                            <UserX className="w-3.5 h-3.5" /> Deny Access
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-slate-800 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" /> Register & Approve Student
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.smith@student.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="student123"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 1001"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                >
                  <option value="">Select a Class...</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Create Student Account & Grant Access
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
