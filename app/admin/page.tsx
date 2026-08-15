'use client';

import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Download, Search, Filter, Users, ShieldCheck, PieChart, ChevronDown, ChevronUp, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface SubmissionRecord {
  id: string;
  teamId: string;
  teamName: string;
  problemStatementId: string;
  problemStatementTitle: string;
  leaderName: string;
  leaderEmail: string;
  leaderMobile: string;
  memberCount: number;
  hasAuthDocx: boolean;
  hasAuthPdf: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [adminTokenInput, setAdminTokenInput] = useState('sih2026_admin_secret_token_key');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Admin Submissions with Bearer Token
  const fetchSubmissions = async (token: string) => {
    setLoadingData(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/letters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        setAuthenticated(true);
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Invalid Admin Authorization Token.');
        setAuthenticated(false);
      }
    } catch (err) {
      setLoginError('Server connection error.');
      setAuthenticated(false);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTokenInput.trim()) return;
    fetchSubmissions(adminTokenInput.trim());
  };

  const handleDownloadLetter = (id: string, type: 'pdf' | 'docx') => {
    window.open(`/api/admin/letters/${id}/download?type=${type}&token=${encodeURIComponent(adminTokenInput)}`, '_blank');
  };

  const handleExportCsv = () => {
    window.open('/api/admin/export', '_blank');
  };

  const filteredSubmissions = submissions.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.teamName.toLowerCase().includes(q) ||
      item.teamId.toLowerCase().includes(q) ||
      item.problemStatementId.toLowerCase().includes(q) ||
      item.leaderName.toLowerCase().includes(q) ||
      item.leaderEmail.toLowerCase().includes(q)
    );
  });

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-surface-border shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-saffron/15 border border-saffron/40 flex items-center justify-center text-saffron mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">SIH 2026 Admin Portal</h1>
            <p className="text-xs text-slate-400 font-mono">Restricted Access — Authorization Letter Desk</p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                Admin Secret Token (`ADMIN_TOKEN`)
              </label>
              <input
                type="password"
                required
                placeholder="Enter secret bearer token"
                value={adminTokenInput}
                onChange={(e) => setAdminTokenInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron"
              />
            </div>

            <button
              type="submit"
              disabled={loadingData}
              className="w-full py-3.5 px-4 text-sm font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all"
            >
              {loadingData ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/details" className="text-xs font-mono text-slate-400 hover:text-saffron">
              ← Return to Event Details
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-surface-border">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-heading font-extrabold text-white">
              SIH 2026 Admin Authorization Desk
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-saffron/20 text-saffron border border-saffron/40">
              Token Protected
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Download & print official SIH College Authorization Letters for Dean/Director wet signature
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-accentGreen hover:bg-accentGreen-hover text-white text-xs font-heading font-bold shadow-green-glow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setAuthenticated(false)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel hover:bg-surface-light text-slate-300 text-xs font-mono transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search Input */}
        <div className="p-4 rounded-2xl glass-panel border border-surface-border flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search team, PS ID, or leader email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          </div>

          <span className="text-xs font-mono text-slate-400 hidden sm:block">
            Total Submissions: {filteredSubmissions.length}
          </span>
        </div>

        {/* Submissions Table */}
        <div className="rounded-2xl glass-panel border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-900 text-slate-400 font-mono uppercase text-[11px] border-b border-surface-border">
                <tr>
                  <th className="p-4">Team ID & Name</th>
                  <th className="p-4">Problem Statement</th>
                  <th className="p-4">Team Leader Info</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Admin Authorization Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                      No team submissions found.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-light/40 transition-colors">
                      
                      <td className="p-4">
                        <div className="font-heading font-bold text-white text-sm">{sub.teamName}</div>
                        <div className="font-mono text-saffron text-[11px]">{sub.teamId} ({sub.memberCount} Members)</div>
                      </td>

                      <td className="p-4 font-sans">
                        <span className="font-mono font-bold text-accentGreen block">{sub.problemStatementId}</span>
                        <span className="text-slate-300 text-xs truncate max-w-xs block">{sub.problemStatementTitle}</span>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-white">{sub.leaderName}</div>
                        <div className="text-[11px] text-slate-400">{sub.leaderEmail} | {sub.leaderMobile}</div>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString('en-IN')}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleDownloadLetter(sub.id, 'pdf')}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono font-bold transition-colors"
                          title="Download Authorization Letter PDF for Printing"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Letter</span>
                        </button>

                        <button
                          onClick={() => handleDownloadLetter(sub.id, 'docx')}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold transition-colors"
                          title="Download Editable DOCX Template"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>DOCX</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
