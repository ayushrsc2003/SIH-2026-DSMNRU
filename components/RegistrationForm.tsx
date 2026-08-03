'use client';

import React, { useState, useMemo } from 'react';
import { User, Mail, Phone, School, IdCard, Award, CheckCircle2, XCircle, AlertCircle, Send, Sparkles, RefreshCw } from 'lucide-react';
import { MemberInput, RegistrationPayload } from '@/lib/types';

const INITIAL_MEMBER: MemberInput = {
  name: '',
  branch: 'B.Tech CSE',
  year: '3rd Year',
  universityId: '',
  gender: '',
  email: '',
  phone: '',
};

const DOMAIN_OPTIONS = [
  'Smart Education',
  'MedTech / Healthcare',
  'Cyber Security / Blockchain',
  'Robotics & Drones',
  'Agriculture & Rural Development',
  'Renewable Energy & Clean Tech',
  'Smart Vehicles & Transportation',
  'Miscellaneous / Open Innovation',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year', 'PhD'];
const BRANCH_OPTIONS = [
  'B.Tech CSE',
  'B.Tech AI & Data Science',
  'B.Tech ECE',
  'B.Tech Mechanical Engineering',
  'B.Tech Electrical Engineering',
  'B.Tech Civil Engineering',
  'BCA',
  'MCA',
  'M.Tech CSE',
  'B.Sc / M.Sc',
  'Other Discipline',
];

export default function RegistrationForm() {
  const [teamName, setTeamName] = useState('');
  const [domain, setDomain] = useState('Smart Education');
  const [ideaSummary, setIdeaSummary] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [mentorDept, setMentorDept] = useState('Computer Science & Engineering');

  const [members, setMembers] = useState<MemberInput[]>([
    { ...INITIAL_MEMBER, isLeader: true },
    { ...INITIAL_MEMBER, isLeader: false },
    { ...INITIAL_MEMBER, isLeader: false },
    { ...INITIAL_MEMBER, isLeader: false },
    { ...INITIAL_MEMBER, isLeader: false },
    { ...INITIAL_MEMBER, isLeader: false },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [conflictDetails, setConflictDetails] = useState<any[] | null>(null);
  const [successResult, setSuccessResult] = useState<{ teamId: string; teamName: string } | null>(null);

  // Helper to update member field
  const updateMember = (index: number, field: keyof MemberInput, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  // Live client-side validation checklist evaluation
  const checklist = useMemo(() => {
    // Check 1: All 6 filled
    const allFilled = members.every(
      (m) =>
        m.name.trim() !== '' &&
        m.universityId.trim() !== '' &&
        m.gender !== '' &&
        m.email.trim() !== '' &&
        m.phone.trim() !== ''
    );

    // Check 2: At least 1 female
    const femaleCount = members.filter((m) => m.gender.toLowerCase() === 'female').length;
    const hasFemale = femaleCount >= 1;

    // Check 3: No duplicate emails inside payload
    const emails = members.map((m) => m.email.toLowerCase().trim()).filter((e) => e !== '');
    const uniqueEmails = new Set(emails);
    const noIntraDuplicates = emails.length === uniqueEmails.size;

    // Check 4: Team meta details filled
    const metaFilled =
      teamName.trim() !== '' &&
      domain !== '' &&
      ideaSummary.trim() !== '' &&
      mentorName.trim() !== '' &&
      mentorDept.trim() !== '';

    return {
      allFilled,
      hasFemale,
      femaleCount,
      noIntraDuplicates,
      metaFilled,
      canSubmit: allFilled && hasFemale && noIntraDuplicates && metaFilled,
    };
  }, [members, teamName, domain, ideaSummary, mentorName, mentorDept]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setConflictDetails(null);

    if (!checklist.canSubmit) {
      setServerError('Please fulfill all live checklist criteria before submitting.');
      return;
    }

    setSubmitting(true);

    const payload: RegistrationPayload = {
      teamName: teamName.trim(),
      domain,
      ideaSummary: ideaSummary.trim(),
      mentorName: mentorName.trim(),
      mentorDept: mentorDept.trim(),
      members: members.map((m, idx) => ({
        ...m,
        isLeader: idx === 0,
      })),
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Failed to register team.');
        if (res.status === 409 && data.conflictDetails) {
          setConflictDetails(data.conflictDetails);
        }
      } else {
        setSuccessResult({
          teamId: data.teamId,
          teamName: data.teamName,
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
    setIdeaSummary('');
    setMentorName('');
    setMembers([
      { ...INITIAL_MEMBER, isLeader: true },
      { ...INITIAL_MEMBER, isLeader: false },
      { ...INITIAL_MEMBER, isLeader: false },
      { ...INITIAL_MEMBER, isLeader: false },
      { ...INITIAL_MEMBER, isLeader: false },
      { ...INITIAL_MEMBER, isLeader: false },
    ]);
    setSuccessResult(null);
    setServerError(null);
    setConflictDetails(null);
  };

  return (
    <section id="register" className="py-16 lg:py-24 relative border-t border-surface-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-saffron mb-2">
            // Official Portal Submission
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white">
            Team Registration Form
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Register your team of exactly 6 DSMNRU students. Re-validated server-side with atomic database unique locks.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
        </div>

        {/* Live Checklist Bar */}
        <div className="mb-10 p-6 rounded-2xl glass-panel border border-saffron/30 shadow-saffron-glow">
          <div className="flex items-center justify-between mb-4 border-b border-surface-border/60 pb-3">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-saffron" />
              <span>Live Client Compliance Checklist</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Database Rules Enforced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-surface-light/60 border border-surface-border">
              {checklist.allFilled ? (
                <CheckCircle2 className="w-5 h-5 text-accentGreen shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <div>
                <p className="text-xs font-heading font-semibold text-white">All 6 Members Complete</p>
                <p className="text-[10px] text-slate-400">All fields filled for 6 students</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-surface-light/60 border border-surface-border">
              {checklist.hasFemale ? (
                <CheckCircle2 className="w-5 h-5 text-accentGreen shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-saffron shrink-0" />
              )}
              <div>
                <p className="text-xs font-heading font-semibold text-white">Min. 1 Female Member</p>
                <p className="text-[10px] text-slate-400">Current female count: {checklist.femaleCount}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-surface-light/60 border border-surface-border">
              {checklist.noIntraDuplicates ? (
                <CheckCircle2 className="w-5 h-5 text-accentGreen shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-heading font-semibold text-white">Unique Team Emails</p>
                <p className="text-[10px] text-slate-400">No duplicate emails in team payload</p>
              </div>
            </div>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-200 text-sm space-y-2">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-bold text-red-300">Registration Error</h4>
                <p className="mt-1 text-xs">{serverError}</p>
              </div>
            </div>

            {conflictDetails && conflictDetails.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-500/30 font-mono text-xs text-red-300 space-y-1">
                <p className="font-bold">Conflicting Member Details Found in Database:</p>
                {conflictDetails.map((c: any, i: number) => (
                  <p key={i}>
                    • <strong>{c.email}</strong> ({c.name}) is already registered in Team <strong>{c.registeredTeam}</strong> (ID: {c.teamId})
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success Modal / Card */}
        {successResult ? (
          <div className="p-8 rounded-3xl glass-panel border border-accentGreen/40 text-center space-y-6 shadow-green-glow">
            <div className="w-16 h-16 rounded-full bg-accentGreen/20 text-accentGreen border border-accentGreen/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-accentGreen font-bold">
                Registration Successful!
              </span>
              <h3 className="text-3xl font-heading font-extrabold text-white mt-1">
                {successResult.teamName}
              </h3>
              <div className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-navy-900 border border-accentGreen/40 font-mono text-lg font-bold text-accentGreen">
                Team ID: {successResult.teamId}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Your team has been registered in the DSMNRU database. Save your <strong className="text-white">Team ID ({successResult.teamId})</strong> for screening updates and status checks.
            </p>

            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-2 px-6 py-3 text-xs font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Register Another Team</span>
            </button>
          </div>
        ) : (
          /* Form Inputs */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Team & Idea Details */}
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-surface-border space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h3 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-saffron text-white text-xs flex items-center justify-center font-mono font-bold">
                    1
                  </span>
                  <span>Team & Project Overview</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Team Name <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Team CodeCRUD"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Problem Domain <span className="text-saffron">*</span>
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron transition-colors"
                  >
                    {DOMAIN_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                  One-Line Idea Summary <span className="text-saffron">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Briefly describe your solution approach (max 150 chars)"
                  value={ideaSummary}
                  onChange={(e) => setIdeaSummary(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Faculty Mentor Name <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rahul Sharma"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Faculty Department <span className="text-saffron">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={mentorDept}
                    onChange={(e) => setMentorDept(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-saffron transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: 6 Member Blocks */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-accentGreen text-white text-xs flex items-center justify-center font-mono font-bold">
                    2
                  </span>
                  <span>Team Members (Exactly 6 Students)</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Member 1 = Team Leader</span>
              </div>

              {members.map((member, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl glass-panel border transition-all ${
                    index === 0
                      ? 'border-saffron/40 bg-surface-light/40'
                      : 'border-surface-border hover:border-surface-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4 border-b border-surface-border/50 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-navy-900 text-slate-200 border border-surface-border">
                        Member #{index + 1}
                      </span>
                      {index === 0 && (
                        <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-saffron/20 text-saffron border border-saffron/40 flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Team Leader</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono text-slate-400">
                      {member.gender ? `Gender: ${member.gender}` : 'Select Gender'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Full Name <span className="text-saffron">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Student Full Name"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      />
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Branch / Course <span className="text-saffron">*</span>
                      </label>
                      <select
                        value={member.branch}
                        onChange={(e) => updateMember(index, 'branch', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      >
                        {BRANCH_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Year */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Academic Year <span className="text-saffron">*</span>
                      </label>
                      <select
                        value={member.year}
                        onChange={(e) => updateMember(index, 'year', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* University Roll / ID */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        University Roll / Reg ID <span className="text-saffron">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DSMNRU/2022/CSE/041"
                        value={member.universityId}
                        onChange={(e) => updateMember(index, 'universityId', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Gender <span className="text-saffron">*</span>
                      </label>
                      <select
                        required
                        value={member.gender}
                        onChange={(e) => updateMember(index, 'gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        University Email <span className="text-saffron">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="student@dsmnru.ac.in"
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                        Contact Phone <span className="text-saffron">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={member.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-mono">
                {checklist.canSubmit ? (
                  <span className="text-accentGreen font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 inline" />
                    <span>All validation rules met. Ready to register!</span>
                  </span>
                ) : (
                  <span className="text-saffron flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 inline" />
                    <span>Please complete all 6 members & gender rule above.</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !checklist.canSubmit}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 text-base font-heading font-bold text-white bg-saffron hover:bg-saffron-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-saffron-glow transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Registering Team...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Official Registration</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </section>
  );
}
