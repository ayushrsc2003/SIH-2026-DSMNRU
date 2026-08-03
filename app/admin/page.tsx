'use client';

import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Download, Search, Filter, Users, ShieldCheck, PieChart, ChevronDown, ChevronUp, RefreshCw, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { TeamRecord } from '@/lib/types';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Check initial authentication
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/teams');
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
        setStats(data.stats);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch (err) {
      setAuthenticated(false);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setPassword('');
        await fetchTeams();
      } else {
        setLoginError(data.error || 'Invalid admin password');
      }
    } catch (err) {
      setLoginError('Server error during login');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setTeams([]);
    setStats(null);
  };

  const handleExportCsv = () => {
    window.open('/api/admin/export', '_blank');
  };

  // Filtered teams computation
  const filteredTeams = teams.filter((team) => {
    const matchesDomain = selectedDomain === 'ALL' || team.domain === selectedDomain;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesDomain;

    const matchesTeamName = team.teamName.toLowerCase().includes(query);
    const matchesTeamId = team.teamId.toLowerCase().includes(query);
    const matchesDomainText = team.domain.toLowerCase().includes(query);
    const matchesMember = team.members.some(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.universityId.toLowerCase().includes(query) ||
        m.phone.includes(query)
    );

    return matchesDomain && (matchesTeamName || matchesTeamId || matchesDomainText || matchesMember);
  });

  // Unique domains list
  const uniqueDomains = Array.from(new Set(teams.map((t) => t.domain)));

  // If auth state loading
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-slate-300 font-mono">
        <RefreshCw className="w-6 h-6 animate-spin text-saffron mr-3" />
        <span>Authenticating Admin Session...</span>
      </div>
    );
  }

  // Unauthenticated: Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-surface-border shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-saffron/15 border border-saffron/40 flex items-center justify-center text-saffron mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">SIH 2026 Admin Portal</h1>
            <p className="text-xs text-slate-400 font-mono">IET DSMNRU Hackathon Coordination</p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin access key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 text-sm font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all"
            >
              {loginLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/" className="text-xs font-mono text-slate-400 hover:text-saffron">
              ← Return to Public Hackathon Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-background text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-surface-border">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-heading font-extrabold text-white">
              SIH 2026 Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-saffron/20 text-saffron border border-saffron/40">
              IET DSMNRU
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Registered Teams & Database Management System
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-accentGreen hover:bg-accentGreen-hover text-white text-xs font-heading font-bold shadow-green-glow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export as CSV</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel hover:bg-surface-light text-slate-300 text-xs font-mono transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl glass-panel border border-surface-border flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-saffron/15 text-saffron border border-saffron/30 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-slate-400">Total Registered Teams</p>
                <h3 className="text-2xl font-heading font-bold text-white mt-0.5">{stats.totalTeams}</h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-surface-border flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-accentGreen/15 text-accentGreen border border-accentGreen/30 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-slate-400">Total Registered Students</p>
                <h3 className="text-2xl font-heading font-bold text-white mt-0.5">{stats.totalStudents}</h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-surface-border flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-slate-400">Gender Check Pass Rate</p>
                <h3 className="text-2xl font-heading font-bold text-white mt-0.5">{stats.genderCheckPassRate}%</h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-surface-border flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-slate-400">Active Domains</p>
                <h3 className="text-2xl font-heading font-bold text-white mt-0.5">
                  {Object.keys(stats.domainCounts || {}).length}
                </h3>
              </div>
            </div>

          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search team, email, ID, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          </div>

          {/* Domain Filter Dropdown */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
            >
              <option value="ALL">All Domains ({teams.length})</option>
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Teams Table */}
        <div className="rounded-2xl glass-panel border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-900 text-slate-400 font-mono uppercase text-[11px] border-b border-surface-border">
                <tr>
                  <th className="p-4">Team ID & Name</th>
                  <th className="p-4">Domain</th>
                  <th className="p-4">Mentor Info</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Gender Check</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                      No matching teams found in database.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => {
                    const isExpanded = expandedTeamId === team.id;
                    const femaleMembers = team.members.filter((m) => m.gender.toLowerCase() === 'female');
                    const leader = team.members.find((m) => m.isLeader) || team.members[0];

                    return (
                      <React.Fragment key={team.id}>
                        <tr className="hover:bg-surface-light/40 transition-colors">
                          
                          {/* Team Name */}
                          <td className="p-4">
                            <div className="font-heading font-bold text-white text-sm">{team.teamName}</div>
                            <div className="font-mono text-saffron text-[11px]">{team.teamId}</div>
                          </td>

                          {/* Domain */}
                          <td className="p-4 font-sans">{team.domain}</td>

                          {/* Mentor */}
                          <td className="p-4">
                            <div className="font-medium text-white">{team.mentorName}</div>
                            <div className="text-[11px] text-slate-400">{team.mentorDept}</div>
                          </td>

                          {/* Members */}
                          <td className="p-4 font-mono">
                            <div>{team.members.length} Members</div>
                            <div className="text-[10px] text-slate-400">Leader: {leader?.name}</div>
                          </td>

                          {/* Gender Check */}
                          <td className="p-4">
                            {femaleMembers.length >= 1 ? (
                              <span className="px-2.5 py-1 rounded-full bg-accentGreen/15 text-accentGreen border border-accentGreen/30 text-[10px] font-mono font-semibold">
                                ✓ Pass ({femaleMembers.length} Female)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-mono font-semibold">
                                ✗ Fail (0 Female)
                              </span>
                            )}
                          </td>

                          {/* Details Toggle */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                              className="p-2 rounded-lg bg-surface-light hover:bg-surface-border text-slate-300 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>

                        </tr>

                        {/* Expanded Member Details Row */}
                        {isExpanded && (
                          <tr className="bg-navy-900/80">
                            <td colSpan={6} className="p-6 border-t border-b border-surface-border/80">
                              <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-surface-light/50 border border-surface-border space-y-1">
                                  <h4 className="text-xs font-mono uppercase text-saffron font-bold">One-Line Idea Summary</h4>
                                  <p className="text-xs text-slate-200 font-sans">{team.ideaSummary}</p>
                                </div>

                                <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
                                  Team Members Breakdown ({team.members.length} Students)
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {team.members.map((m, mIdx) => (
                                    <div
                                      key={m.id}
                                      className={`p-3.5 rounded-xl border text-xs space-y-1 font-mono ${
                                        m.isLeader
                                          ? 'bg-saffron/10 border-saffron/40'
                                          : 'bg-navy-900 border-surface-border'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between font-bold text-white">
                                        <span>{m.name}</span>
                                        {m.isLeader && (
                                          <span className="text-[10px] px-2 py-0.5 rounded bg-saffron text-white">
                                            Leader
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-slate-300">{m.branch} ({m.year})</div>
                                      <div className="text-slate-400">ID: {m.universityId} | {m.gender}</div>
                                      <div className="text-saffron truncate">{m.email}</div>
                                      <div className="text-slate-400">Ph: {m.phone}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
