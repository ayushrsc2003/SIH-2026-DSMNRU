'use client';

import React from 'react';
import { Trophy, Star, Award, Code, ExternalLink, Sparkles } from 'lucide-react';

export default function HallOfFame() {
  const finalists = [
    {
      name: 'Md. Afnan',
      teamName: 'Team CodeCRUD',
      role: 'Team Leader',
      achievement: 'SIH National Grand Finalist',
      domain: 'Smart Education',
      project: 'AI-Driven Accessible Learning Assistant for Visually Impaired Students',
      branch: 'B.Tech CSE, IET DSMNRU',
      quote: '"SIH internal round at DSMNRU gave us the platform and mentor feedback needed to refine our prototype into a winning national entry."',
    },
    {
      name: 'Ayush Chaurasiya',
      teamName: 'Team Emotispeak',
      role: 'Team Leader',
      achievement: 'SIH National Grand Finalist',
      domain: 'MedTech / Assistive Tech',
      project: 'Neural Emotion-to-Speech Communication Interface for Non-Verbal Individuals',
      branch: 'B.Tech CSE, IET DSMNRU',
      quote: '"Building for real problem statements under tight deadlines prepared our team for national competition and industry coding standards."',
    },
  ];

  return (
    <section id="hall-of-fame" className="py-16 lg:py-24 relative bg-navy-800/60 border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-xs font-mono mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Legacy of Excellence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Hall of Fame — Past National Finalists
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Celebrating IET DSMNRU teams who cracked the internal round and represented the university at the SIH Grand Finale.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
        </div>

        {/* Finalists Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {finalists.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl glass-panel glass-panel-hover border border-saffron/30 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Background Glow Badge */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Trophy className="w-32 h-32 text-saffron" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-saffron/15 text-saffron border border-saffron/30 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-saffron text-saffron" />
                    <span>{item.achievement}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">{item.branch}</span>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="text-2xl font-heading font-extrabold text-white">{item.teamName}</h3>
                  <p className="text-sm font-semibold text-accentGreen">Lead by {item.name} ({item.role})</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-light/70 border border-surface-border space-y-2 mb-6">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                    <Code className="w-4 h-4 text-saffron" />
                    <strong className="text-white">Domain:</strong> {item.domain}
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    <strong className="text-white">Project:</strong> {item.project}
                  </p>
                </div>

                <blockquote className="text-xs sm:text-sm text-slate-300 italic font-sans border-l-2 border-saffron pl-4 py-1">
                  {item.quote}
                </blockquote>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-border/50 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>DSMNRU Representative</span>
                <span className="text-accentGreen">National Stage Contender</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
