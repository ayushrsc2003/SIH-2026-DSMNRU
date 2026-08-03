'use client';

import React from 'react';
import { Sparkles, Code2, Layout, TrendingUp, MessageSquare } from 'lucide-react';

export default function Evaluation() {
  const criteria = [
    {
      title: 'Innovation & Originality',
      weight: '25%',
      icon: Sparkles,
      color: 'border-saffron/40 text-saffron bg-saffron/10',
      desc: 'Uniqueness of the proposed solution, novelty of the approach, and creative application of technology to solve the problem statement.',
    },
    {
      title: 'Technical Feasibility & Architecture',
      weight: '25%',
      icon: Code2,
      color: 'border-accentGreen/40 text-accentGreen bg-accentGreen/10',
      desc: 'Robustness of technology stack, code quality, clean software/hardware architecture, and realistic implementation viability.',
    },
    {
      title: 'Usability, UX & Accessibility',
      weight: '20%',
      icon: Layout,
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
      desc: 'User-friendly interface design, smooth workflow, responsive layout, and inclusivity for differently-abled users.',
    },
    {
      title: 'Scalability & Real-World Impact',
      weight: '15%',
      icon: TrendingUp,
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      desc: 'Potential for real-world deployment, scalability to handle large user bases or geographic regions, and societal/economic value.',
    },
    {
      title: 'Presentation & Live Q&A Defense',
      weight: '15%',
      icon: MessageSquare,
      color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
      desc: 'Clarity of presentation pitch, confidence during jury questions, and ability of all 6 team members to defend their implementation.',
    },
  ];

  return (
    <section id="evaluation" className="py-16 lg:py-24 relative border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accentGreen mb-2">
            // Jury Scoring Rubric
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Evaluation Criteria & Weightage
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Transparent metrics used by the internal screening panel to evaluate and shortlist winning teams.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-accentGreen to-saffron rounded-full mt-4" />
        </div>

        {/* Criteria Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {criteria.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-panel glass-panel-hover border border-surface-border relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 text-sm font-mono font-bold rounded-full bg-surface-light border border-surface-border text-white">
                      {item.weight}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{item.desc}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-surface-border/50 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Metric #{idx + 1}</span>
                  <span className="text-saffron">Internal Jury Rubric</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
