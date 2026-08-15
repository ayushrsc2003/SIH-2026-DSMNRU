'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import About from '@/components/About';
import WhyParticipate from '@/components/WhyParticipate';
import Timeline from '@/components/Timeline';
import Rules from '@/components/Rules';
import Evaluation from '@/components/Evaluation';
import HallOfFame from '@/components/HallOfFame';
import Contact from '@/components/Contact';
import { ArrowRight, UserPlus, FileText, CheckCircle2, Sparkles, Trophy } from 'lucide-react';

export default function DetailsPage() {
  const stepsToRegister = [
    {
      step: '1',
      title: 'Form Your Team of 6',
      desc: 'Assemble 1 Team Leader + 5 Members from regular DSMNRU students (Must include at least 1 female participant).',
    },
    {
      step: '2',
      title: 'Select Problem Statement',
      desc: 'Browse official SIH 2026 Problem Statements or Open Innovation themes and obtain your PS ID (e.g. SIH1721).',
    },
    {
      step: '3',
      title: 'Prepare Idea PPT / PDF',
      desc: 'Create your 5-slide idea synopsis file (.pdf, .ppt, or .pptx under 5 MB) detailing your architecture & approach.',
    },
    {
      step: '4',
      title: 'Submit Online Registration',
      desc: 'Fill out the /register form. Your official SIH College Authorization Letter will be generated for Dean/Director signature.',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-slate-100 relative">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-surface-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border border-saffron/30 shadow-saffron-glow mb-6">
            <Sparkles className="w-4 h-4 text-saffron animate-pulse" />
            <span className="text-xs font-mono font-medium text-slate-200">
              Official SIH 2026 Internal Screening Round
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Event Details & Guidelines <br />
            <span className="text-saffron-gradient">SIH 2026 Internal Round</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Institute of Engineering & Technology (IET), Dr. Shakuntala Misra National Rehabilitation University (DSMNRU), Lucknow.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center space-x-3 px-8 py-4 text-base font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all duration-300 transform hover:-translate-y-1"
            >
              <UserPlus className="w-5 h-5" />
              <span>Go to Team Registration</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </section>

      {/* About Section */}
      <About />

      {/* Why Participate */}
      <WhyParticipate />

      {/* How to Register Steps */}
      <section className="py-16 lg:py-24 relative border-t border-surface-border/50 bg-navy-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-saffron mb-2">
              // Step-by-Step Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
              How to Register Your Team
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Follow these 4 simple steps to complete your team submission and authorization letter generation.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-saffron to-accentGreen rounded-full mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepsToRegister.map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-panel glass-panel-hover border border-surface-border flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-saffron/15 text-saffron border border-saffron/30 flex items-center justify-center font-mono font-bold text-lg mb-4">
                    {s.step}
                  </div>
                  <h3 className="text-base font-heading font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-surface-border/50 text-[11px] font-mono text-accentGreen flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Requirement Verified</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 px-8 py-4 text-base font-heading font-bold text-white bg-accentGreen hover:bg-accentGreen-hover rounded-xl shadow-green-glow transition-all"
            >
              <span>Proceed to Registration Form</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Timeline */}
      <Timeline />

      {/* Rules & Regulations */}
      <Rules />

      {/* Evaluation Criteria */}
      <Evaluation />

      {/* Hall of Fame */}
      <HallOfFame />

      {/* Contact Block */}
      <Contact />

      <Footer />
    </main>
  );
}
