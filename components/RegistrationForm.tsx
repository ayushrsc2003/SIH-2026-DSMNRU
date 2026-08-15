'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function RegistrationForm() {
  return (
    <div className="p-8 rounded-3xl glass-panel border border-saffron/30 text-center space-y-4">
      <h3 className="text-xl font-heading font-bold text-white">Team Registration Portal</h3>
      <p className="text-xs text-slate-300 max-w-md mx-auto">
        Registration is hosted on our dedicated `/register` workflow page with automated SIH College Authorization Letter generation.
      </p>
      <Link
        href="/register"
        className="inline-flex items-center space-x-2 px-6 py-3 text-xs font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all"
      >
        <UserPlus className="w-4 h-4" />
        <span>Open Registration Form (/register)</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
