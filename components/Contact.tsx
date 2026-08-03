'use client';

import React from 'react';
import { User, Phone, Mail, GraduationCap, Globe, MapPin, Building, ExternalLink } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-16 lg:py-24 relative bg-navy-800/60 border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-saffron mb-2">
            // Organizers & Helpdesk
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Contact & Coordination Team
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Reach out to the SPOC or Student Coordinator for any queries regarding problem statements or registration.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* SPOC Card */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-saffron/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-saffron/20 text-saffron border border-saffron/40">
                  University SPOC
                </span>
                <Building className="w-5 h-5 text-saffron" />
              </div>

              <h3 className="text-xl font-heading font-bold text-white mb-1">Ms. Shalini Raghuvanshi</h3>
              <p className="text-xs font-mono text-accentGreen mb-4">Assistant Professor, Dept. of CSE</p>

              <div className="space-y-2 text-xs text-slate-300 font-sans">
                <p className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>IET, DSMNRU Lucknow</span>
                </p>
                <p className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Faculty Block B, IET Campus</span>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border/50 text-xs font-mono text-slate-400">
              Single Point of Contact for SIH 2026
            </div>
          </div>

          {/* Student Coordinator Card */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-accentGreen/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-accentGreen/20 text-accentGreen border border-accentGreen/40">
                  Student Coordinator
                </span>
                <User className="w-5 h-5 text-accentGreen" />
              </div>

              <h3 className="text-xl font-heading font-bold text-white mb-1">Ayush Chaurasiya</h3>
              <p className="text-xs font-mono text-saffron mb-4">B.Tech CSE 4th Year, IET DSMNRU</p>

              <div className="space-y-2.5 text-xs text-slate-300 font-sans">
                <a
                  href="tel:7838504972"
                  className="flex items-center space-x-2.5 hover:text-accentGreen transition-colors"
                >
                  <Phone className="w-4 h-4 text-accentGreen shrink-0" />
                  <span>+91 7838504972</span>
                </a>

                <a
                  href="mailto:achaurasiya_csebtech23_041@dsmnru.ac.in"
                  className="flex items-center space-x-2.5 hover:text-accentGreen transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-accentGreen shrink-0" />
                  <span>achaurasiya_csebtech23_041@dsmnru.ac.in</span>
                </a>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border/50 text-xs font-mono text-slate-400">
              Student Queries & Registration Support
            </div>
          </div>

          {/* Official SIH Portal Card */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-surface-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-surface-light text-slate-300 border border-surface-border">
                  National Portal
                </span>
                <Globe className="w-5 h-5 text-blue-400" />
              </div>

              <h3 className="text-xl font-heading font-bold text-white mb-1">Official SIH Portal</h3>
              <p className="text-xs font-mono text-slate-400 mb-4">Ministry of Education Innovation Cell</p>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Explore nationwide problem statements, guidelines, and previous winning prototypes on the official national hackathon website.
              </p>

              <a
                href="https://sih.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface-light hover:bg-surface-border text-xs font-mono font-bold text-white transition-colors"
              >
                <span>sih.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5 text-saffron" />
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border/50 text-xs font-mono text-slate-400">
              Government of India SIH Portal
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
