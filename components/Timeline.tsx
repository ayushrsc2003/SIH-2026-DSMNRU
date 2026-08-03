'use client';

import React from 'react';
import { Calendar, CheckCircle, Clock, Award, Sparkles, MapPin, Code2 } from 'lucide-react';

export default function Timeline() {
  const steps = [
    {
      step: '01',
      title: 'Registration Phase',
      date: 'Active Now',
      desc: 'Form your team of 6 members (min 1 female). Submit team details & mentor info on this portal.',
      status: 'Current Phase',
      active: true,
      icon: Code2,
    },
    {
      step: '02',
      title: 'Orientation & Problem Statement Workshop',
      date: 'Upcoming',
      desc: 'Briefing session at IET Auditorium by SPOC Ms. Shalini Raghuvanshi on selecting & solving PS.',
      status: 'Scheduled',
      active: false,
      icon: Clock,
    },
    {
      step: '03',
      title: 'Idea PPT & Synopsis Submission',
      date: 'Phase 2',
      desc: 'Submit your solution approach as per official SIH 2026 PPT format including architecture diagrams.',
      status: 'Upcoming',
      active: false,
      icon: Calendar,
    },
    {
      step: '04',
      title: 'Internal Screening Round',
      date: 'Phase 3',
      desc: 'Domain experts and faculty jury evaluate submitted PPTs to shortlist top teams for the live hackathon.',
      status: 'Upcoming',
      active: false,
      icon: CheckCircle,
    },
    {
      step: '05',
      title: 'Grand Hackathon Day (On-Campus)',
      date: 'Hackathon Day',
      desc: 'Live 24-Hour prototype building & live code defense at IET DSMNRU Campus, Lucknow.',
      status: 'On-Campus',
      active: false,
      icon: MapPin,
    },
    {
      step: '06',
      title: 'Final Evaluation & Jury Round',
      date: 'Finals',
      desc: 'Demonstrate working prototype, live code, design choices, and answer jury questions.',
      status: 'Jury Round',
      active: false,
      icon: Sparkles,
    },
    {
      step: '07',
      title: 'Official SIH 2026 Portal Nomination',
      date: 'Final Outcome',
      desc: 'Top shortlisted teams selected & uploaded by University SPOC to the official sih.gov.in portal.',
      status: 'Nomination',
      active: false,
      icon: Award,
    },
  ];

  return (
    <section id="timeline" className="py-16 lg:py-24 relative border-t border-surface-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-saffron mb-2">
            // Roadmap to Nomination
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Event Timeline & Milestones
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Stepped milestone process from internal registration to national portal upload.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
        </div>

        {/* Vertical Stepped List with Connector Line */}
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-saffron before:via-accentGreen before:to-surface-border">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative group">
                
                {/* Step Marker Dot */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    item.active
                      ? 'bg-saffron border-white text-navy-900 shadow-saffron-glow scale-110'
                      : 'bg-navy-900 border-surface-border text-slate-400 group-hover:border-saffron'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">{item.step}</span>
                </div>

                {/* Content Card */}
                <div
                  className={`p-6 rounded-2xl glass-panel glass-panel-hover border ${
                    item.active ? 'border-saffron/40 bg-surface-light/80 shadow-saffron-glow' : 'border-surface-border'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono font-semibold text-saffron uppercase tracking-wider">
                        Step {item.step}
                      </span>
                      <h3 className="text-lg font-heading font-bold text-white">{item.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-0.5 text-[11px] font-mono font-semibold rounded-full border ${
                          item.active
                            ? 'bg-saffron/20 text-saffron border-saffron/40 animate-pulse'
                            : 'bg-surface-light text-slate-400 border-surface-border'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{item.date}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{item.desc}</p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
