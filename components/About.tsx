'use client';

import React from 'react';
import { Target, Lightbulb, Compass, Award } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: Target,
      title: 'Nationwide Initiative',
      desc: 'Smart India Hackathon is a flagship initiative by MoE’s Innovation Cell & AICTE to solve pressing challenges of ministries, industries, and NGOs.',
    },
    {
      icon: Lightbulb,
      title: 'Internal Screening',
      desc: 'DSMNRU internal round serves as the gateway to evaluate, filter, and refine student ideas before official submission to the national portal.',
    },
    {
      icon: Compass,
      title: 'Faculty Mentorship',
      desc: 'Top internal teams get dedicated guidance from IET faculty members and industry experts to polish prototypes and pitches.',
    },
    {
      icon: Award,
      title: 'National Grand Finale',
      desc: 'Nominated teams compete against top institutions across India for cash prizes up to ₹1,00,000 per problem statement at national nodal centers.',
    },
  ];

  return (
    <section id="about" className="py-16 lg:py-24 relative border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-saffron mb-2">
            // Context & Vision
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            About Smart India Hackathon 2026
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Text Block */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-surface-border">
              <h3 className="text-xl font-heading font-bold text-white mb-3 flex items-center space-x-2">
                <span>Empowering DSMNRU Innovators</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Smart India Hackathon (SIH) is a nationwide initiative by the <strong className="text-white">Ministry of Education’s Innovation Cell (MIC)</strong> and <strong className="text-white">AICTE</strong> to engage students in solving real-world problems faced by central & state ministries, PSUs, and private industries.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed mt-4">
                At <strong className="text-saffron">Institute of Engineering & Technology (IET), DSMNRU Lucknow</strong>, the internal hackathon round acts as an incubator where student teams present their hardware or software solutions, receive live expert feedback, and secure the university’s official nomination for SIH 2026.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-saffron/10 border border-saffron/30 flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-saffron text-white shrink-0 mt-0.5">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-heading font-bold text-white">Mission Statement</h4>
                <p className="text-xs text-slate-300 mt-1">
                  To cultivate a culture of innovation, product design, and problem-solving among engineering and general discipline students at Dr. Shakuntala Misra National Rehabilitation University.
                </p>
              </div>
            </div>
          </div>

          {/* Right Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between"
                >
                  <div className="p-3 rounded-xl bg-surface-light border border-surface-border w-fit text-accentGreen mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-heading font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
