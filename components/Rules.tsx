'use client';

import React, { useState } from 'react';
import { Users, Code, Scale, Check, ShieldAlert, FileWarning, Cpu, Lightbulb } from 'lucide-react';

export default function Rules() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'team' | 'submission' | 'conduct'>('all');

  const ruleCategories = [
    { id: 'all', label: 'All Rules (13)', icon: Scale },
    { id: 'team', label: 'Team & Eligibility', icon: Users },
    { id: 'submission', label: 'Submission & Building', icon: Code },
    { id: 'conduct', label: 'Judging & Conduct', icon: ShieldAlert },
  ];

  const rulesList = [
    // Category: Team & Eligibility (1 - 5)
    {
      id: 1,
      category: 'team',
      categoryLabel: 'Team & Eligibility',
      title: 'Mandatory Team Size of Exactly 6 Members',
      desc: 'Each team MUST consist of exactly 6 regular students from DSMNRU. Neither fewer nor more than 6 members are allowed in a team.',
      badge: 'Critical Rule',
      badgeColor: 'border-saffron/40 text-saffron bg-saffron/10',
    },
    {
      id: 2,
      category: 'team',
      categoryLabel: 'Team & Eligibility',
      title: 'Mandatory Female Diversity Rule',
      desc: 'Every team MUST include at least one female team member. All-male teams are strictly disqualified per official SIH guidelines.',
      badge: 'Gender Rule',
      badgeColor: 'border-accentGreen/40 text-accentGreen bg-accentGreen/10',
    },
    {
      id: 3,
      category: 'team',
      categoryLabel: 'Team & Eligibility',
      title: 'One Student = One Team Only',
      desc: 'A student can belong to AT MOST ONE team across the entire university. Dual registrations are strictly prohibited and enforced via database unique constraints.',
      badge: 'Strict Enforcement',
      badgeColor: 'border-red-500/40 text-red-400 bg-red-500/10',
    },
    {
      id: 4,
      category: 'team',
      categoryLabel: 'Team & Eligibility',
      title: 'Institutional Eligibility (DSMNRU Regular Students)',
      desc: 'All team members must be enrolled in regular UG, PG, or PhD programs at Dr. Shakuntala Misra National Rehabilitation University, Lucknow.',
      badge: 'Eligibility',
      badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      id: 5,
      category: 'team',
      categoryLabel: 'Team & Eligibility',
      title: 'Faculty Mentors Provision (1-2 Mentors)',
      desc: 'Teams may have 1 to 2 faculty mentors. Mentors provide guidance only and DO NOT count towards the 6 student members.',
      badge: 'Mentor Rule',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    },

    // Category: Submission & Building (6 - 9)
    {
      id: 6,
      category: 'submission',
      categoryLabel: 'Submission & Building',
      title: 'Original Problem Statement Alignment',
      desc: 'Solutions must directly map to one of the published problem statements (or open innovation domain) approved by the internal hackathon committee.',
      badge: 'Problem Domain',
      badgeColor: 'border-saffron/40 text-saffron bg-saffron/10',
    },
    {
      id: 7,
      category: 'submission',
      categoryLabel: 'Submission & Building',
      title: 'Use of AI Tools & Generative AI Policy',
      desc: 'AI tools (e.g., ChatGPT, Claude, GitHub Copilot) are allowed for ideation and code reference, BUT teams MUST defend all code, architecture, and design live.',
      badge: 'AI Policy',
      badgeColor: 'border-accentGreen/40 text-accentGreen bg-accentGreen/10',
    },
    {
      id: 8,
      category: 'submission',
      categoryLabel: 'Submission & Building',
      title: 'Repository & Live Demo Requirement',
      desc: 'Every software team must maintain a public Git repository with regular commits. Hardware teams must present a physical operational model.',
      badge: 'Deliverable',
      badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      id: 9,
      category: 'submission',
      categoryLabel: 'Submission & Building',
      title: 'PPT Presentation Format Compliance',
      desc: 'Idea synopses must adhere strictly to the official 5-slide SIH PPT format (Problem, Proposed Solution, Tech Stack, Feasibility, Impact).',
      badge: 'Format Rule',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    },

    // Category: Judging & Conduct (10 - 13)
    {
      id: 10,
      category: 'conduct',
      categoryLabel: 'Judging & Conduct',
      title: 'Zero Tolerance for Plagiarism & Pre-built Projects',
      desc: 'Submitting pre-existing commercial projects or copy-pasting existing open-source projects without significant original work results in immediate disqualification.',
      badge: 'Disqualification',
      badgeColor: 'border-red-500/40 text-red-400 bg-red-500/10',
    },
    {
      id: 11,
      category: 'conduct',
      categoryLabel: 'Judging & Conduct',
      title: 'Live Q&A Defense Before Jury',
      desc: 'All 6 team members must be present during evaluation. Jury members reserve the right to question any member on specific code logic or hardware design.',
      badge: 'Evaluation',
      badgeColor: 'border-saffron/40 text-saffron bg-saffron/10',
    },
    {
      id: 12,
      category: 'conduct',
      categoryLabel: 'Judging & Conduct',
      title: 'Code of Conduct & Academic Integrity',
      desc: 'Participants must maintain professional decorum, respect fellow competitors, and abide by DSMNRU university campus discipline guidelines.',
      badge: 'Conduct',
      badgeColor: 'border-accentGreen/40 text-accentGreen bg-accentGreen/10',
    },
    {
      id: 13,
      category: 'conduct',
      categoryLabel: 'Judging & Conduct',
      title: 'Finality of Jury & SPOC Decisions',
      desc: 'The decision of the internal jury panel and SPOC Ms. Shalini Raghuvanshi regarding team selection and SIH nomination is final and binding.',
      badge: 'Final Authority',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    },
  ];

  const filteredRules = activeCategory === 'all' 
    ? rulesList 
    : rulesList.filter(r => r.category === activeCategory);

  return (
    <section id="rules" className="py-16 lg:py-24 relative bg-navy-800/40 border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-saffron mb-2">
            // Guidelines & Compliance
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Rules & Regulations (13 Mandatory Rules)
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Strictly enforced rules to ensure fair play, academic integrity, and seamless SIH portal nomination.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {ruleCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-saffron text-white shadow-saffron-glow'
                    : 'glass-panel text-slate-300 hover:bg-surface-light border border-surface-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Rules Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="p-6 rounded-2xl glass-panel glass-panel-hover border border-surface-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Rule #{rule.id < 10 ? `0${rule.id}` : rule.id}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-full border ${rule.badgeColor}`}>
                    {rule.badge}
                  </span>
                </div>

                <h3 className="text-base font-heading font-bold text-white mb-2 leading-snug">
                  {rule.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {rule.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Group: {rule.categoryLabel}</span>
                <Check className="w-4 h-4 text-accentGreen" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
