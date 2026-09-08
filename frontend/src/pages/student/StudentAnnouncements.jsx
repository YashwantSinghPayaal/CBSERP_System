import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bell, FileText, ExternalLink } from 'lucide-react';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-rose-400" /> Institution Announcements & PDF Circulars
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Browse official news, notices, and PDF circular attachments uploaded by your school admin.
        </p>
      </div>

      {/* Announcements List */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
          <span>Active Circulars ({announcements.length})</span>
          <Bell className="w-4 h-4 text-slate-400" />
        </h2>

        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-500 text-xs py-8 text-center">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="text-slate-500 text-xs py-8 text-center">No announcements published yet.</p>
          ) : (
            announcements.map((ann) => (
              <div key={ann._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{ann.title}</h3>
                    {ann.pdfUrl && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-3xs font-extrabold border border-rose-500/30 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> PDF Circular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ann.description}</p>
                  <div className="text-3xs text-slate-500 pt-1">
                    Posted on: {new Date(ann.postedOn || ann.createdAt).toLocaleDateString()} | By: {ann.uploadedByAdmin?.name || 'Admin'} ({ann.uploadedByAdmin?.role || 'School Authority'})
                  </div>
                </div>

                {ann.pdfUrl && (
                  <div className="shrink-0 self-start sm:self-center">
                    <a
                      href={ann.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> View & Download PDF
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
