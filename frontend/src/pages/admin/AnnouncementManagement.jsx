import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  Bell,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Megaphone
} from 'lucide-react';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title) return;

    setUploading(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      const res = await api.post('/announcements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMsg('Official PDF announcement published successfully!');
        setTitle('');
        setDescription('');
        setPdfFile(null);
        setTimeout(() => setMsg(''), 3500);
        fetchAnnouncements();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement circular?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        fetchAnnouncements();
      }
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-rose-400" /> PDF Announcements & School Circulars
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Publish official notices and upload PDF attachments for student portal access.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {msg}
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Megaphone className="w-4 h-4 text-rose-400" /> Post New Circular
          </h2>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Announcement Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Sports Meet 2026 Guidelines"
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description / Details</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the notice..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Attach PDF Document (Optional)</label>
              <div className="p-4 rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-center relative cursor-pointer hover:border-rose-500 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-3xs text-slate-400 block">
                  {pdfFile ? pdfFile.name : 'Click or Drag PDF file here'}
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
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Publish Announcement PDF
                </>
              )}
            </button>
          </form>
        </div>

        {/* Circular List */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
            <span>Published Circulars & Announcements ({announcements.length})</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-slate-500 text-xs py-6 text-center">Loading circulars...</p>
            ) : announcements.length === 0 ? (
              <p className="text-slate-500 text-xs py-6 text-center">No announcements published yet.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann._id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{ann.title}</h3>
                      {ann.pdfUrl && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-3xs font-extrabold border border-rose-500/30 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> PDF Attached
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ann.description}</p>
                    <div className="text-3xs text-slate-500 pt-1">
                      Posted on: {new Date(ann.postedOn || ann.createdAt).toLocaleDateString()} | By: {ann.uploadedByAdmin?.name || 'Admin'} ({ann.uploadedByAdmin?.role})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {ann.pdfUrl && (
                      <a
                        href={ann.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View PDF
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(ann._id)}
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
