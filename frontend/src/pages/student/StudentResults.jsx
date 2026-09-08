import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Award, FileText, ExternalLink, Sparkles } from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/results/my-results');
      if (res.data.success) {
        setResults(res.data.results || []);
      }
    } catch (err) {
      console.error('Failed to load student results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Award className="w-7 h-7 text-amber-400" /> My Exam Results & Official Report Cards
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          View your personal examination scores, subject grade breakdowns, and download official PDF report cards.
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {loading ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs rounded-3xl">
            Loading exam results...
          </div>
        ) : results.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs rounded-3xl">
            No exam results uploaded for your account yet.
          </div>
        ) : (
          results.map((resItem) => (
            <div key={resItem._id} className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800">
              {/* Exam Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-3xs font-extrabold border border-amber-500/30 uppercase tracking-wider mb-2 inline-block">
                    {resItem.session?.yearLabel || 'Academic Session'}
                  </span>
                  <h2 className="text-xl font-bold text-white">{resItem.examName}</h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-3xs text-slate-400 font-bold uppercase block">Overall Percentage</span>
                    <span className="text-2xl font-black text-emerald-400">{resItem.percentage}%</span>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center min-w-[70px]">
                    <span className="text-3xs text-slate-400 font-bold uppercase block">Grade</span>
                    <span className="text-xl font-black text-purple-300">{resItem.grade}</span>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table if available */}
              {resItem.marks && resItem.marks.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                        <th className="p-3">Subject</th>
                        <th className="p-3">Marks Obtained</th>
                        <th className="p-3">Max Marks</th>
                        <th className="p-3">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {resItem.marks.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-white">{m.subject}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">{m.marksObtained}</td>
                          <td className="p-3 font-mono text-slate-400">{m.maxMarks || 100}</td>
                          <td className="p-3 font-bold text-purple-300">{m.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Remarks & Download Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-400 italic">
                  Remarks: {resItem.remarks || 'Satisfactory academic progress recorded.'}
                </p>

                {resItem.pdfUrl && (
                  <a
                    href={resItem.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" /> Download Official Report Card PDF
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
