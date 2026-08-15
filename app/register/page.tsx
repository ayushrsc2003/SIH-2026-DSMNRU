'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, Upload, CheckCircle2, AlertCircle, Send, RefreshCw, FileText, ExternalLink, ShieldCheck, Sparkles, FolderOpen, Globe, ArrowUpRight } from 'lucide-react';

interface MemberFormState {
  name: string;
  gender: string;
  email: string;
  phone: string;
}

const INITIAL_MEMBER: MemberFormState = {
  name: '',
  gender: '',
  email: '',
  phone: '',
};

const OFFICIAL_GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1pkQZVk9vs5_PW9H1tYnH7-HaQJ1xZsaw";

export default function RegisterPage() {
  const [teamName, setTeamName] = useState('');
  const [problemStatementTitle, setProblemStatementTitle] = useState('');
  const [problemStatementId, setProblemStatementId] = useState('');
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  // Leader state
  const [leader, setLeader] = useState<MemberFormState>({ ...INITIAL_MEMBER });

  // 5 Team Members state
  const [members, setMembers] = useState<MemberFormState[]>([
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
  ]);

  // File Upload State
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Form Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<{ message: string; teamId: string } | null>(null);

  // Helper to update member
  const updateMember = (index: number, field: keyof MemberFormState, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  // Handle File Selection with client-side validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];

    if (!file) {
      setPptFile(null);
      return;
    }

    const allowedExts = ['.pdf', '.ppt', '.pptx'];
    const fileNameLower = file.name.toLowerCase();
    const isAllowedExt = allowedExts.some((ext) => fileNameLower.endsWith(ext));

    if (!isAllowedExt) {
      setFileError('Invalid file type! Only .pdf, .ppt, and .pptx files are allowed.');
      setPptFile(null);
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileError(`File size (${sizeMB} MB) exceeds maximum allowed limit of 5 MB.`);
      setPptFile(null);
      return;
    }

    setPptFile(file);
  };

  // Dynamic Client-side Validation Checklist
  const checklist = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    // Team Meta Filled
    const metaValid =
      teamName.trim() !== '' &&
      problemStatementTitle.trim() !== '' &&
      problemStatementId.trim() !== '';

    // Leader Valid
    const leaderValid =
      leader.name.trim() !== '' &&
      leader.gender !== '' &&
      emailRegex.test(leader.email.trim()) &&
      phoneRegex.test(leader.phone.trim().replace(/\D/g, ''));

    // 5 Members Valid
    const membersValid = members.every(
      (m) =>
        m.name.trim() !== '' &&
        m.gender !== '' &&
        emailRegex.test(m.email.trim()) &&
        phoneRegex.test(m.phone.trim().replace(/\D/g, ''))
    );

    // Gender Diversity: At least 1 female across leader + 5 members
    const allGenders = [leader.gender, ...members.map((m) => m.gender)];
    const femaleCount = allGenders.filter((g) => g.toLowerCase() === 'female' || g.toLowerCase() === 'f').length;
    const hasFemale = femaleCount >= 1;

    // Unique Emails Check
    const allEmails = [leader.email, ...members.map((m) => m.email)].map((e) => e.toLowerCase().trim()).filter(Boolean);
    const uniqueEmails = new Set(allEmails);
    const noDuplicateEmails = allEmails.length === 6 && uniqueEmails.size === 6;

    // File Uploaded or Google Drive Link provided
    const fileOrDriveValid = (pptFile !== null && fileError === null) || googleDriveLink.trim() !== '';

    const canSubmit =
      metaValid &&
      leaderValid &&
      membersValid &&
      hasFemale &&
      noDuplicateEmails &&
      fileOrDriveValid &&
      acknowledged;

    return {
      metaValid,
      leaderValid,
      membersValid,
      hasFemale,
      femaleCount,
      noDuplicateEmails,
      fileOrDriveValid,
      canSubmit,
    };
  }, [teamName, problemStatementTitle, problemStatementId, leader, members, pptFile, fileError, googleDriveLink, acknowledged]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!checklist.canSubmit) {
      setServerError('Please complete all required fields and checklist rules before submitting.');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('teamName', teamName.trim());
    formData.append('problemStatementTitle', problemStatementTitle.trim());
    formData.append('problemStatementId', problemStatementId.trim());
    formData.append('googleDriveLink', googleDriveLink.trim() || OFFICIAL_GOOGLE_DRIVE_FOLDER_URL);
    formData.append('acknowledged', acknowledged ? 'true' : 'false');

    formData.append('leaderName', leader.name.trim());
    formData.append('leaderGender', leader.gender);
    formData.append('leaderEmail', leader.email.trim().toLowerCase());
    formData.append('leaderMobile', leader.phone.trim());

    formData.append('members', JSON.stringify(members));
    if (pptFile) {
      formData.append('pptFile', pptFile);
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Team registration failed.');
      } else {
        setSuccessResponse({
          message: data.message,
          teamId: data.teamId,
        });
      }
    } catch (err: any) {
      setServerError('Network or server error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTeamName('');
    setProblemStatementTitle('');
    setProblemStatementId('');
    setGoogleDriveLink('');
    setAcknowledged(false);
    setLeader({ ...INITIAL_MEMBER });
    setMembers([
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
    ]);
    setPptFile(null);
    setFileError(null);
    setServerError(null);
    setSuccessResponse(null);
  };

  return (
    <main className="min-h-screen bg-background text-slate-100 relative">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-saffron mb-2">
            // Official Portal Submission
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white">
            SIH 2026 Team Registration Form
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Register your team (1 Leader + 5 Members). Generates official SIH 2026 College Authorization Letter automatically.
          </p>
          
          <div className="mt-4 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Policy: Single Form Submission Per User Email</span>
          </div>

          <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
        </div>

        {/* Success Screen */}
        {successResponse ? (
          <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-accentGreen/40 text-center space-y-6 shadow-green-glow">
            <div className="w-16 h-16 rounded-full bg-accentGreen/20 text-accentGreen border border-accentGreen/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-accentGreen font-bold">
                Submission Confirmed!
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Team Registration Successful
              </h2>
              <div className="inline-block mt-2 px-5 py-2 rounded-xl bg-navy-900 border border-accentGreen/40 font-mono text-base font-bold text-accentGreen">
                Team ID: {successResponse.teamId}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {successResponse.message}
            </p>

            <div className="p-4 rounded-xl bg-navy-900/80 border border-surface-border text-xs text-slate-400 font-mono space-y-1 max-w-md mx-auto">
              <p className="text-saffron font-bold">🔒 Admin Workflow Note:</p>
              <p>Your official Authorization Letter has been routed to college administration for printing and Principal/Dean wet signature.</p>
            </div>

            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-2 px-6 py-3 text-xs font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Register Another Team</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Live Compliance Checklist */}
            <div className="p-6 rounded-2xl glass-panel border border-saffron/30 shadow-saffron-glow">
              <div className="flex items-center justify-between mb-4 border-b border-surface-border/60 pb-3">
                <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-saffron" />
                  <span>Submission Compliance Checklist</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Strict Validation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-surface-light/60 border border-surface-border">
                  {checklist.metaValid ? <CheckCircle2 className="w-4 h-4 text-accentGreen shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />}
                  <span className="text-slate-200">Team & PS ID</span>
                </div>

                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-surface-light/60 border border-surface-border">
                  {checklist.hasFemale ? <CheckCircle2 className="w-4 h-4 text-accentGreen shrink-0" /> : <AlertCircle className="w-4 h-4 text-saffron shrink-0" />}
                  <span className="text-slate-200">Min 1 Female ({checklist.femaleCount})</span>
                </div>

                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-surface-light/60 border border-surface-border">
                  {checklist.noDuplicateEmails ? <CheckCircle2 className="w-4 h-4 text-accentGreen shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className="text-slate-200">Single Form / Unique Mail</span>
                </div>

                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-surface-light/60 border border-surface-border">
                  {checklist.fileOrDriveValid ? <CheckCircle2 className="w-4 h-4 text-accentGreen shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />}
                  <span className="text-slate-200">Google Drive / PPT File</span>
                </div>
              </div>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-200">Submission Error</h4>
                  <p className="mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            {/* Step 1: Team & Problem Statement Info */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-surface-border space-y-6">
              <div className="border-b border-surface-border pb-3">
                <h2 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-saffron text-white text-xs flex items-center justify-center font-mono font-bold">1</span>
                  <span>Team & Problem Statement Info</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Team Name <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Team CodeCRUD"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Problem Statement ID <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SIH1721"
                    value={problemStatementId}
                    onChange={(e) => setProblemStatementId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Problem Statement Title <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief PS Title"
                    value={problemStatementTitle}
                    onChange={(e) => setProblemStatementTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Team Leader Details */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-saffron/40 bg-surface-light/30 space-y-6">
              <div className="border-b border-surface-border pb-3 flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-saffron text-white text-xs flex items-center justify-center font-mono font-bold">2</span>
                  <span>Team Leader Details</span>
                </h2>
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-saffron/20 text-saffron border border-saffron/40">
                  Team Leader
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    Leader Name <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={leader.name}
                    onChange={(e) => setLeader({ ...leader, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    Gender <span className="text-saffron">*</span>
                  </label>
                  <select
                    required
                    value={leader.gender}
                    onChange={(e) => setLeader({ ...leader, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                  >
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    University Email <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="leader@dsmnru.ac.in"
                    value={leader.email}
                    onChange={(e) => setLeader({ ...leader, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    Mobile Number <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={leader.phone}
                    onChange={(e) => setLeader({ ...leader, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Team Members × 5 */}
            <div className="space-y-4">
              <div className="border-b border-surface-border pb-3">
                <h2 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-accentGreen text-white text-xs flex items-center justify-center font-mono font-bold">3</span>
                  <span>Team Members (Exactly 5 Members)</span>
                </h2>
              </div>

              {members.map((m, index) => (
                <div key={index} className="p-5 rounded-2xl glass-panel border border-surface-border hover:border-surface-border/80">
                  <div className="flex items-center justify-between mb-3 border-b border-surface-border/50 pb-2">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Team Member #{index + 1}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {m.gender ? `Gender: ${m.gender}` : 'Select Gender'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Member Name <span className="text-saffron">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`Member ${index + 1} Name`}
                        value={m.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Gender <span className="text-saffron">*</span>
                      </label>
                      <select
                        required
                        value={m.gender}
                        onChange={(e) => updateMember(index, 'gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      >
                        <option value="">-- Select --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Email Address <span className="text-saffron">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="member@dsmnru.ac.in"
                        value={m.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Mobile Number <span className="text-saffron">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={m.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 4: Official Google Drive Upload Folder Banner */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-accentGreen/40 space-y-6">
              <div className="border-b border-surface-border pb-3 flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-accentGreen text-white text-xs flex items-center justify-center font-mono font-bold">4</span>
                  <span>Official Google Drive Presentation Folder</span>
                </h2>
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-accentGreen/20 text-accentGreen border border-accentGreen/40">
                  Required Destination
                </span>
              </div>

              {/* Banner with direct link to Google Drive folder */}
              <div className="p-5 rounded-2xl bg-navy-900/80 border border-accentGreen/30 space-y-3">
                <div className="flex items-start space-x-3">
                  <FolderOpen className="w-6 h-6 text-accentGreen shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-heading font-bold text-white">
                      Official DSMNRU SIH 2026 Submission Folder
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Upload your idea PPT/PDF file directly to our official university Google Drive folder, named as <strong className="text-saffron">SIH2026_[TeamName]_[PS_ID]</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={OFFICIAL_GOOGLE_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accentGreen hover:bg-accentGreen-hover text-white text-xs font-heading font-bold shadow-green-glow transition-all"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Open Official Google Drive Folder</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <span className="text-xs text-slate-400 font-mono">
                    or paste your uploaded file link below:
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Option A: Google Drive Uploaded File Link */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                    Option 1: Paste Your Google Drive File Link <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={googleDriveLink}
                    onChange={(e) => setGoogleDriveLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-accentGreen"
                  />
                  <p className="text-[10px] text-slate-400 font-mono">Paste link of your file uploaded to the folder above</p>
                </div>

                {/* Input Option B: Direct Attachment Backup */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                    Option 2: Direct Local Backup Upload (.pdf, .ppt, .pptx &lt; 5MB)
                  </label>
                  <div className="relative border-2 border-dashed border-surface-border hover:border-saffron rounded-xl p-3 text-center transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <p className="text-xs font-heading font-bold text-white truncate">
                      {pptFile ? `Selected: ${pptFile.name}` : 'Click to attach local file backup'}
                    </p>
                  </div>
                  {fileError && <p className="text-xs font-mono text-red-400">{fileError}</p>}
                </div>
              </div>
            </div>

            {/* Step 5: Official SIH Authorization Letter Acknowledgement */}
            <div className="p-6 rounded-2xl glass-panel border border-saffron/30 space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acknowledged"
                  required
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 w-4 h-4 text-saffron bg-navy-900 border-surface-border rounded focus:ring-saffron"
                />
                <label htmlFor="acknowledged" className="text-xs text-slate-300 leading-relaxed font-sans cursor-pointer">
                  I hereby acknowledge and agree that our team details will be used to automatically populate the official{' '}
                  <a
                    href="https://www.sih.gov.in/letters/College-Authorization-letter-SIH2026.docx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-saffron underline hover:text-saffron-hover inline-flex items-center space-x-1"
                  >
                    <span>SIH 2026 College Authorization Letter Format</span>
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  . I confirm that our team contains at least 1 female participant and all team members are regular DSMNRU students. Each user/email can submit only one registration.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !checklist.canSubmit}
                className="w-full inline-flex items-center justify-center space-x-3 py-4 px-8 text-base font-heading font-bold text-white bg-saffron hover:bg-saffron-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-saffron-glow transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting Team Registration...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Team Registration</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>

      <Footer />
    </main>
  );
}
