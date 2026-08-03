'use client';

import React from 'react';
import { Sparkles, Shield, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-10 glass-panel border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-saffron/20 border border-saffron/40 flex items-center justify-center text-saffron">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-heading font-bold text-white">
                SIH 2026 Internal Round — IET DSMNRU
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Dr. Shakuntala Misra National Rehabilitation University, Lucknow
              </p>
            </div>
          </div>

          {/* Right Copyright & Admin Quick Access */}
          <div className="flex items-center space-x-6 text-xs text-slate-400 font-mono">
            <span>© 2026 IET DSMNRU. All rights reserved.</span>
            <a
              href="/admin"
              className="inline-flex items-center space-x-1 hover:text-saffron transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
