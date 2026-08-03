'use client';

import React from 'react';
import { Users, UserCheck, Trophy, MapPin, Award, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenCheckStatus: () => void;
}

export default function Hero({ onOpenCheckStatus }: HeroProps) {
  const highlights = [
    {
      icon: Users,
      title: '6 Team Members',
      desc: 'Mandatory team size (1 Leader + 5 Members)',
      accent: 'border-saffron/30 text-saffron bg-saffron/10',
    },
    {
      icon: UserCheck,
      title: 'Min 1 Female',
      desc: 'Gender diversity rule strictly enforced',
      accent: 'border-accentGreen/30 text-accentGreen bg-accentGreen/10',
    },
    {
      icon: MapPin,
      title: 'On-Campus Mode',
      desc: 'IET DSMNRU Campus, Lucknow',
      accent: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    },
    {
      icon: Award,
      title: 'UG / PG / PhD',
      desc: 'Open to all regular DSMNRU students',
      accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-saffron/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-accentGreen/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Institutional Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border border-saffron/30 shadow-saffron-glow mb-6">
            <span className="flex h-2 w-2 rounded-full bg-saffron animate-pulse" />
            <span className="text-xs font-mono font-medium text-slate-200">
              Ministry of Education & AICTE Initiative
            </span>
          </div>

          <h2 className="text-xs sm:text-sm font-mono tracking-widest text-slate-400 uppercase mb-3">
            Institute of Engineering & Technology (IET)
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-accentGreen uppercase tracking-wider mb-6">
            Dr. Shakuntala Misra National Rehabilitation University (DSMNRU), Lucknow
          </p>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
            Smart India Hackathon <span className="text-saffron-gradient">2026</span>
          </h1>
          <p className="mt-2 text-2xl sm:text-4xl font-heading font-semibold text-slate-300">
            Internal College Hackathon Round
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl font-sans leading-relaxed">
            The official campus hackathon to innovate, build real-world solutions, and earn direct nomination to represent DSMNRU at the nationwide <strong className="text-white">SIH 2026 Grand Finale</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="#register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 text-base font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all duration-300 transform hover:-translate-y-1"
            >
              <span>Register Your Team</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <button
              onClick={onOpenCheckStatus}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 text-sm font-mono font-medium text-slate-200 glass-panel hover:bg-surface-light border border-surface-border rounded-xl transition-all duration-200"
            >
              <UserCheck className="w-4 h-4 text-accentGreen" />
              <span>Check My Status</span>
            </button>
          </div>

          {/* Ultimate Reward Banner */}
          <div className="mt-10 max-w-xl w-full p-4 rounded-2xl glass-panel border border-accentGreen/30 flex items-center space-x-4 text-left">
            <div className="p-3 rounded-xl bg-accentGreen/10 border border-accentGreen/30 shrink-0">
              <Trophy className="w-7 h-7 text-accentGreen" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-accentGreen font-semibold">Ultimate Prize & Outcome</span>
              <p className="text-sm font-heading font-bold text-white">
                Official Nomination to SIH 2026 Grand Finale + Institutional Mentorship & Funding Support
              </p>
            </div>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${item.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Rule</span>
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
