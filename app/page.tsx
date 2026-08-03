'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import WhyParticipate from '@/components/WhyParticipate';
import Timeline from '@/components/Timeline';
import Rules from '@/components/Rules';
import Evaluation from '@/components/Evaluation';
import HallOfFame from '@/components/HallOfFame';
import RegistrationForm from '@/components/RegistrationForm';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CheckStatusModal from '@/components/CheckStatusModal';

export default function Home() {
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-slate-100 relative">
      <Navbar onOpenCheckStatus={() => setIsCheckStatusOpen(true)} />
      
      <Hero onOpenCheckStatus={() => setIsCheckStatusOpen(true)} />
      
      <About />
      
      <WhyParticipate />
      
      <Timeline />
      
      <Rules />
      
      <Evaluation />
      
      <HallOfFame />
      
      <RegistrationForm />
      
      <Contact />
      
      <Footer />

      <CheckStatusModal
        isOpen={isCheckStatusOpen}
        onClose={() => setIsCheckStatusOpen(false)}
      />
    </main>
  );
}
