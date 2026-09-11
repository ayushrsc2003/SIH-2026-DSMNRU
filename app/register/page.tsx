'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProblemStatementSelect, { ProblemStatementOption } from '@/components/ProblemStatementSelect';
import { uploadPresentationToCloudinary } from '@/lib/uploadToCloudinary';
import { User, Mail, Phone, Upload, CheckCircle2, AlertCircle, Send, RefreshCw, Lock, Sparkles, ExternalLink, ShieldCheck, Clock, FileText } from 'lucide-react';

interface MemberFormState {
  name: string;
  gender: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
}

const INITIAL_MEMBER: MemberFormState = {
  name: '',
  gender: '',
  email: '',
  phone: '',
  branch: '',
  year: '',
};

export default function RegisterPage() {
  // Config Status Guard State
  const [configLoading, setConfigLoading] = useState(true);
  const [isRegistrationActive, setIsRegistrationActive] = useState(false);

  // Form Fields
  const [teamName, setTeamName] = useState('');
  const [problemStatementTitle, setProblemStatementTitle] = useState('');
  const [problemStatementId, setProblemStatementId] = useState('');
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

  // Check Registration Active Status on Initial Load
  useEffect(() => {
    fetchRegistrationStatus();
  }, []);

  const fetchRegistrationStatus = async () => {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/config/registration-status');
      if (res.ok) {
        const data = await res.json();
        setIsRegistrationActive(data.isRegistrationActive);
      } else {
        setIsRegistrationActive(false);
      }
    } catch (err) {
      setIsRegistrationActive(false);
    } finally {
      setConfigLoading(false);
    }
  };

  // Helper to update member
  const updateMember = (index: number, field: keyof MemberFormState, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  // Handle PS Selection from Dropdown
  const handlePsSelect = (ps: ProblemStatementOption) => {
    setProblemStatementId(ps.psCode);
    setProblemStatementTitle(ps.title);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];

    if (!file) {
      setPptFile(null);
      return;
    }

    const allowedExts = ['.ppt', '.pptx', '.doc', '.docx', '.pdf'];
    const fileNameLower = file.name.toLowerCase();
    const isAllowedExt = allowedExts.some((ext) => fileNameLower.endsWith(ext));

    if (!isAllowedExt) {
      setFileError('Invalid file type! Allowed formats are .ppt, .pptx, .doc, .docx, and .pdf.');
      setPptFile(null);
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileError(`File size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB. Please compress your document.`);
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
      phoneRegex.test(leader.phone.trim().replace(/\D/g, '')) &&
      leader.branch !== '' &&
      leader.year !== '';

    // 5 Members Valid
    const membersValid = members.every(
      (m) =>
        m.name.trim() !== '' &&
        m.gender !== '' &&
        emailRegex.test(m.email.trim()) &&
        phoneRegex.test(m.phone.trim().replace(/\D/g, '')) &&
        m.branch !== '' &&
        m.year !== ''
    );

    // Gender Diversity: At least 1 female across leader + 5 members
    const allGenders = [leader.gender, ...members.map((m) => m.gender)];
    const femaleCount = allGenders.filter((g) => g.toLowerCase() === 'female' || g.toLowerCase() === 'f').length;
    const hasFemale = femaleCount >= 1;

    // Unique Emails Check
    const allEmails = [leader.email, ...members.map((m) => m.email)].map((e) => e.toLowerCase().trim()).filter(Boolean);
    const uniqueEmails = new Set(allEmails);
    const noDuplicateEmails = allEmails.length === 6 && uniqueEmails.size === 6;

    // File Uploaded
    const fileValid = pptFile !== null && fileError === null;

    const canSubmit =
      metaValid &&
      leaderValid &&
      membersValid &&
      hasFemale &&
      noDuplicateEmails &&
      fileValid &&
      acknowledged;

    return {
      metaValid,
      leaderValid,
      membersValid,
      hasFemale,
      femaleCount,
      noDuplicateEmails,
      fileValid,
      canSubmit,
    };
  }, [teamName, problemStatementTitle, problemStatementId, leader, members, pptFile, fileError, acknowledged]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!checklist.canSubmit) {
      setServerError('Please complete all required fields, including branches and academic years, and upload your presentation before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      if (!pptFile) throw new Error('Please select a presentation file.');
      const uploadedPresentation = await uploadPresentationToCloudinary(pptFile);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          problemStatementTitle: problemStatementTitle.trim(),
          problemStatementId: problemStatementId.trim(),
          acknowledged,
          leader: { ...leader, name: leader.name.trim(), email: leader.email.trim().toLowerCase(), phone: leader.phone.trim(), branch: leader.branch },
          members: members.map((member) => ({ ...member, name: member.name.trim(), email: member.email.trim().toLowerCase(), phone: member.phone.trim(), branch: member.branch })),
          pptUrl: uploadedPresentation.pptUrl,
          pptFileName: uploadedPresentation.fileName,
        }),
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
      setServerError(err?.message || 'Network or server error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTeamName('');
    setProblemStatementTitle('');
    setProblemStatementId('');
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

  const handleFillDemoData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setTeamName(`CodeInnovators_${randomSuffix}`);
    setProblemStatementId('SIH1721');
    setProblemStatementTitle('AI-Driven Accessible Learning Assistant for Differently-Abled Students');
    setAcknowledged(true);
    setLeader({
      name: 'Ayush Chaurasiya',
      gender: 'Male',
      email: `achaurasiya_${randomSuffix}@dsmnru.ac.in`,
      phone: '7838504972',
      branch: 'CSE',
      year: '2023-2027',
    });
    setMembers([
      {
        name: 'Ananya Verma',
        gender: 'Female',
        email: `ananya_${randomSuffix}@gmail.com`,
        phone: '9876543211',
        branch: 'CSE AIDS',
        year: '2024-2028',
      },
      {
        name: 'Rohan Gupta',
        gender: 'Male',
        email: `rohan_${randomSuffix}@gmail.com`,
        phone: '9876543212',
        branch: 'ECE',
        year: '2023-2027',
      },
      {
        name: 'Priya Srivastava',
        gender: 'Female',
        email: `priya_${randomSuffix}@gmail.com`,
        phone: '9876543213',
        branch: 'CSE AIFM',
        year: '2025-2029',
      },
      {
        name: 'Shivam Pandey',
        gender: 'Male',
        email: `shivam_${randomSuffix}@gmail.com`,
        phone: '9876543214',
        branch: 'ME',
        year: '2024-2028',
      },
      {
        name: 'Kavya Tripathi',
        gender: 'Female',
        email: `kavya_${randomSuffix}@gmail.com`,
        phone: '9876543215',
        branch: 'EE',
        year: '2023-2027',
      },
    ]);
    setServerError(null);
  };

  // 1. Loading State
  if (configLoading) {
    return (
      <main className="min-h-screen bg-background text-slate-100 relative flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center font-mono text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-saffron mx-auto" />
          <p>Verifying Registration Status...</p>
        </div>
        <Footer />
      </main>
    );
  }

  // 2. Registrations Closed Guard Screen
  if (!isRegistrationActive) {
    return (
      <main className="min-h-screen bg-background text-slate-100 relative flex flex-col justify-between">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-saffron/15 border border-saffron/40 flex items-center justify-center text-saffron mx-auto shadow-saffron-glow">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest rounded-full bg-saffron/20 text-saffron border border-saffron/40">
              System Notice
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white">
              Registrations Currently Closed
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-sans leading-relaxed">
              Student team registration for SIH 2026 Internal Round at IET DSMNRU is currently closed by college administration.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-surface-border text-left max-w-lg mx-auto space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <Clock className="w-4 h-4 text-saffron" />
              <span>Registration Status: <strong>OFF / Closed</strong></span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Please contact SPOC Ms. Shalini Raghuvanshi or Student Coordinator Ayush Chaurasiya for schedule announcements.
            </p>
          </div>

          <div>
            <a
              href="/details"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-surface-light border border-surface-border text-xs font-mono font-bold text-white hover:bg-surface-border transition-colors"
            >
              <span>View Event Details & Guidelines →</span>
            </a>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // 3. Active Registration Form Screen
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

          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200 text-sm font-heading font-bold">
            <Clock className="w-4 h-4 text-red-400" />
            <span>Registration closes on 14 September 2026 at 1:00 PM | Hackathon on 15th & 16th September 2026</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>UGC Registration No: <strong>U-0512</strong> (DSMNRU)</span>
            </span>
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accentGreen/10 border border-accentGreen/30 text-accentGreen text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Private File Storage: Admin Review Only</span>
            </span>
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Single Form Submission Per User</span>
            </span>
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
              <p>Your uploaded PPT synopsis has been received. The official Authorization Letter has been automatically generated and forwarded to the college administration / Dean office for official internal review.</p>
            </div>

            <div>
              <button
                onClick={handleReset}
                className="inline-flex items-center space-x-2 px-6 py-3 text-xs font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Register Another Team</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Live Compliance Checklist */}
            <div className="p-6 rounded-2xl glass-panel border border-saffron/30 shadow-saffron-glow">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-surface-border/60 pb-3">
                <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-saffron" />
                  <span>Submission Compliance Checklist</span>
                </h3>
                <button
                  type="button"
                  onClick={handleFillDemoData}
                  className="px-3 py-1.5 rounded-lg bg-saffron/20 border border-saffron/40 hover:bg-saffron/30 text-saffron font-mono text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <span>⚡ Auto-Fill Sample Test Data</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-surface-light/60 border border-surface-border">
                  {checklist.metaValid ? <CheckCircle2 className="w-4 h-4 text-accentGreen shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />}
                  <span className="text-slate-200">Team & PS Selected</span>
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
                  {checklist.fileValid ? <CheckCircle2 className="w-4 h-4 text-accentGreen shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />}
                  <span className="text-slate-200">Idea File &le; 10MB Uploaded</span>
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
              <div className="border-b border-surface-border pb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-saffron text-white text-xs flex items-center justify-center font-mono font-bold">1</span>
                  <span>Team & Problem Statement Selection</span>
                </h2>
                <span className="px-2.5 py-1 rounded-lg bg-surface-light border border-surface-border text-[11px] font-mono text-slate-300">
                  UGC AISHE Code: <strong className="text-saffron">U-0512</strong>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-900/60 border border-surface-border/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="text-slate-300">
                  <span className="text-slate-400">Institutional Affiliation: </span>
                  <span className="text-white font-semibold">IET, Dr. Shakuntala Misra National Rehabilitation University, Lucknow</span>
                </div>
                <div className="text-accentGreen flex items-center space-x-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>UGC Registered: U-0512</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
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

                {/* Dropdown Selector */}
                <div className="md:col-span-2">
                  <ProblemStatementSelect
                    selectedPsCode={problemStatementId}
                    onSelect={handlePsSelect}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                    Email Address <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="leader@gmail.com"
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

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    Branch <span className="text-saffron">*</span>
                  </label>
                  <select
                    required
                    value={leader.branch}
                    onChange={(e) => setLeader({ ...leader, branch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                  >
                    <option value="">-- Branch --</option>
                    <option value="CSE">CSE</option>
                    <option value="CSE AIDS">CSE AIDS</option>
                    <option value="CSE AIFM">CSE AIFM</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    Academic Year <span className="text-saffron">*</span>
                  </label>
                  <select
                    required
                    value={leader.year}
                    onChange={(e) => setLeader({ ...leader, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                  >
                    <option value="">-- Year --</option>
                    <option value="2023-2027">2023-2027</option>
                    <option value="2024-2028">2024-2028</option>
                    <option value="2025-2029">2025-2029</option>
                    <option value="2026-2030">2026-2030</option>
                  </select>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                        placeholder="member@gmail.com"
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

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Branch <span className="text-saffron">*</span>
                      </label>
                      <select
                        required
                        value={m.branch}
                        onChange={(e) => updateMember(index, 'branch', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      >
                        <option value="">-- Branch --</option>
                        <option value="CSE">CSE</option>
                        <option value="CSE AIDS">CSE AIDS</option>
                        <option value="CSE AIFM">CSE AIFM</option>
                        <option value="ECE">ECE</option>
                        <option value="EE">EE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Academic Year <span className="text-saffron">*</span>
                      </label>
                      <select
                        required
                        value={m.year}
                        onChange={(e) => updateMember(index, 'year', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      >
                        <option value="">-- Year --</option>
                        <option value="2023-2027">2023-2027</option>
                        <option value="2024-2028">2024-2028</option>
                        <option value="2025-2029">2025-2029</option>
                        <option value="2026-2030">2026-2030</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 4: Direct Private File Upload (Max 10MB) */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-surface-border space-y-4">
              <div className="border-b border-surface-border pb-3 flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-saffron text-white text-xs flex items-center justify-center font-mono font-bold">4</span>
                  <span>Upload Idea Presentation / Document (Required)</span>
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-mono rounded bg-accentGreen/15 text-accentGreen border border-accentGreen/30">
                  🔒 Encrypted Server Storage
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                  Upload Idea File (.ppt, .pptx, .doc, .docx, .pdf, Max 10 MB) <span className="text-saffron">*</span>
                </label>
                
                <div className="relative border-2 border-dashed border-surface-border hover:border-saffron rounded-2xl p-8 text-center transition-colors">
                  <input
                    type="file"
                    required
                    accept=".ppt,.pptx,.doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="w-9 h-9 text-saffron mx-auto mb-2" />
                  <p className="text-sm font-heading font-bold text-white">
                    {pptFile ? `Selected: ${pptFile.name} (${(pptFile.size / (1024 * 1024)).toFixed(2)} MB)` : 'Click or Drag & Drop your presentation / Word file here'}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">Allowed formats: .ppt, .pptx, .doc, .docx, .pdf (Maximum size: 10 MB)</p>
                </div>

                {fileError && (
                  <p className="mt-2 text-xs font-mono text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fileError}</span>
                  </p>
                )}
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
                    <span>Processing Submission...</span>
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
