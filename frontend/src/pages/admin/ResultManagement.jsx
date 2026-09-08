import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  Award,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

export default function ResultManagement() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [examName, setExamName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [grade, setGrade] = useState('A+');
  const [remarks, setRemarks] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [stRes, sessRes, resRes] = await Promise.all([
        api.get('/students?status=approved'),
        api.get('/sessions'),
        api.get('/results/all')
      ]);

      const stList = stRes.data.students || [];
      const sessList = sessRes.data.sessions || [];
      const resList = resRes.data.results || [];

      setStudents(stList);
      setSessions(sessList);
      setResults(resList);

      if (stList.length > 0) setSelectedStudent(stList[0]._id);
      const activeS = sessList.find(s => s.isActive) || sessList[0];
      if (activeS) setSelectedSession(activeS._id);
    } catch (err) {
      console.error('Failed to load results metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResult = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSession || !examName) return;

    setUploading(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('studentId', selectedStudent);
      formData.append('sessionId', selectedSession);
      formData.append('examName', examName);
      formData.append('percentage', percentage || 0);
      formData.append('grade', grade);
      formData.append('remarks', remarks);
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      const res = await api.post('/results', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMsg('Exam result & PDF report card uploaded successfully!');
        setExamName('');
        setPercentage('');
        setRemarks('');
        setPdfFile(null);
        setTimeout(() => setMsg(''), 3500);

        // Refresh results
        const updated = await api.get('/results/all');
        setResults(updated.data.results || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload result');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam result record?')) return;
    try {
      const res = await api.delete(`/results/${id}`);
      if (res.data.success) {
        setResults(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      alert('Failed to delete result');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Award className="w-7 h-7 text-purple-400" /> Exam Results & Report Cards
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Upload exam grades, percentage summaries, and official PDF report cards per student.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {msg}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Result Upload Form */}
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Upload className="w-4 h-4 text-purple-400" /> Upload Report Card
          </h2>

          <form onSubmit={handleUploadResult} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-white outline-none"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNumber || 'No Roll'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Academic Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-white outline-none"
              >
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.yearLabel} {s.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Exam Title</label>
              <input
                type="text"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. Mid-Term Examination 2025"
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="92.5"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Grade</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="A+"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Teacher appraisal remark..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Attach Result PDF</label>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-center relative cursor-pointer hover:border-purple-500 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-3xs text-slate-400 block">
                  {pdfFile ? pdfFile.name : 'Choose Report Card PDF'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Award className="w-4 h-4" /> Publish Exam Result & PDF
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results List */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
            <span>Published Student Report Cards ({results.length})</span>
            <Award className="w-4 h-4 text-purple-400" />
          </h2>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-slate-500 text-xs py-6 text-center">Loading report cards...</p>
            ) : results.length === 0 ? (
              <p className="text-slate-500 text-xs py-6 text-center">No exam results uploaded yet.</p>
            ) : (
              results.map((resItem) => (
                <div key={resItem._id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{resItem.student?.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-extrabold text-3xs border border-purple-500/30">
                        {resItem.examName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                      <span>Score: <strong className="text-emerald-400">{resItem.percentage}%</strong></span>
                      <span>Grade: <strong className="text-amber-400">{resItem.grade}</strong></span>
                      <span className="text-3xs text-slate-500">Session: {resItem.session?.yearLabel}</span>
                    </div>

                    {resItem.remarks && (
                      <p className="text-3xs text-slate-400 mt-1">{resItem.remarks}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {resItem.pdfUrl && (
                      <a
                        href={resItem.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Download Report Card PDF
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(resItem._id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
