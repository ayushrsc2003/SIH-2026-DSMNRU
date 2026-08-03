'use client';

import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';
import { CheckStatusResponse } from '@/lib/types';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckStatusModal({ isOpen, onClose }: CheckStatusModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckStatusResponse | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data: CheckStatusResponse = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        registered: false,
        message: 'Unable to communicate with status server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setEmail('');
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-surface-border shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-accentGreen/15 border border-accentGreen/30 text-accentGreen">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Check Registration Status</h3>
              <p className="text-xs text-slate-400 font-mono">Public Status Verification</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-surface-light hover:bg-surface-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
              Registered University Email <span className="text-saffron">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter your registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-navy-900 border border-surface-border text-white text-sm focus:outline-none focus:border-accentGreen transition-colors"
              />
              <Search className="absolute right-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 text-sm font-heading font-bold text-white bg-accentGreen hover:bg-accentGreen-hover disabled:opacity-50 rounded-xl shadow-green-glow transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking Database...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify Registration</span>
              </>
            )}
          </button>
        </form>

        {/* Status Result Display */}
        {result && (
          <div className="pt-2">
            {result.registered ? (
              <div className="p-5 rounded-2xl bg-accentGreen/10 border border-accentGreen/30 space-y-3">
                <div className="flex items-center space-x-2 text-accentGreen font-heading font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Student Registration Confirmed!</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-900 border border-surface-border font-mono text-xs space-y-1">
                  <p className="text-slate-400">Team Name: <strong className="text-white">{result.teamName}</strong></p>
                  <p className="text-slate-400">Team ID: <strong className="text-saffron">{result.teamId}</strong></p>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  🔒 Note: Privacy protected. Only your assigned team name and ID are shown.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-saffron/10 border border-saffron/30 space-y-2">
                <div className="flex items-center space-x-2 text-saffron font-heading font-bold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Not Registered</span>
                </div>
                <p className="text-xs text-slate-300">
                  {result.message || 'No team registration found associated with this email address.'}
                </p>
                <a
                  href="#register"
                  onClick={handleModalClose}
                  className="inline-block mt-2 text-xs font-mono text-saffron underline hover:text-saffron-hover"
                >
                  Click here to register your team now →
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
