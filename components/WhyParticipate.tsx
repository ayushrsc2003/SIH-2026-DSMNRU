'use client';

import React from 'react';
import { Cpu, Users, Award, FileCode2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function WhyParticipate() {
  const benefits = [
    {
      icon: Cpu,
      title: 'Real Industry Problem Statements',
      desc: 'Work on actual problem statements released by Govt. Ministries, PSUs, and top technology companies.',
      tag: 'Practical Impact',
    },
    {
      icon: Users,
      title: 'Faculty & Expert Mentorship',
      desc: 'Receive direct technical architecture and pitching feedback from IET DSMNRU faculty and past SIH finalists.',
      tag: 'Guidance',
    },
    {
      icon: Award,
      title: 'Official Nomination & Cash Awards',
      desc: 'Top internal teams get official nomination to SIH 2026 Grand Finale with national cash prizes up to ₹1 Lakh.',
      tag: 'Recognition',
    },
    {
      icon: FileCode2,
      title: 'High-Impact Resume & Career Boost',
      desc: 'Showcase a validated, working prototype on your resume and GitHub to stand out for top tech placements.',
      tag: 'Career Value',
    },
  ];

  return (
    <section id="why-participate" className="py-16 lg:py-24 relative bg-navy-800/50 border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accentGreen mb-2">
            // Value Proposition
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Why You Should Participate
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Transform theoretical knowledge into real-world software and hardware prototypes that matter.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-accentGreen to-saffron rounded-full mt-4" />
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-panel glass-panel-hover border border-surface-border relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-saffron/10 border border-saffron/30 text-saffron">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 text-[11px] font-mono font-medium rounded-full bg-surface-light border border-surface-border text-slate-300">
                    {benefit.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-heading font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{benefit.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-border/60 flex items-center space-x-2 text-xs font-mono text-accentGreen">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified DSMNRU Hackathon Advantage</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
