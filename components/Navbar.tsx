'use client';

import React, { useState } from 'react';
import { Menu, X, ShieldCheck, UserCheck, Sparkles, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenCheckStatus: () => void;
}

export default function Navbar({ onOpenCheckStatus }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About SIH', href: '#about' },
    { name: 'Why Join', href: '#why-participate' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Rules', href: '#rules' },
    { name: 'Evaluation', href: '#evaluation' },
    { name: 'Hall of Fame', href: '#hall-of-fame' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-saffron to-accentGreen p-0.5 shadow-saffron-glow">
              <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-saffron" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-lg tracking-tight text-white">
                  SIH <span className="text-saffron">2026</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-saffron/15 text-saffron border border-saffron/30">
                  Internal Round
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">IET, DSMNRU Lucknow</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="hover:text-saffron transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={onOpenCheckStatus}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-mono font-medium text-slate-200 bg-surface-light hover:bg-surface-border border border-surface-border rounded-lg transition-all duration-200"
            >
              <UserCheck className="w-4 h-4 text-accentGreen" />
              <span>Check Status</span>
            </button>
            <a
              href="#register"
              onClick={(e) => handleNavClick(e, '#register')}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-heading font-semibold text-white bg-saffron hover:bg-saffron-hover rounded-lg shadow-saffron-glow transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Register Team</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={onOpenCheckStatus}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-surface-light border border-surface-border"
              title="Check Status"
            >
              <UserCheck className="w-5 h-5 text-accentGreen" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-surface-light border border-surface-border"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-surface-border px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-surface-light rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-surface-border flex flex-col space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCheckStatus();
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-mono font-medium text-slate-200 bg-surface-light border border-surface-border rounded-lg"
            >
              <UserCheck className="w-4 h-4 text-accentGreen" />
              <span>Check Registration Status</span>
            </button>
            <a
              href="#register"
              onClick={(e) => handleNavClick(e, '#register')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-heading font-semibold text-white bg-saffron rounded-lg shadow-saffron-glow"
            >
              <span>Register Team Now</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
