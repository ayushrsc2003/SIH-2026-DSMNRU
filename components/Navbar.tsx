'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, ChevronRight, FileText, UserPlus, Lock } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Event Details', href: '/details', icon: FileText },
    { name: 'Register Team', href: '/register', icon: UserPlus },
    { name: 'Admin Portal', href: '/admin', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <Link href="/details" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-saffron to-accentGreen p-0.5 shadow-saffron-glow transition-transform group-hover:scale-105">
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
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-saffron bg-saffron/10 border border-saffron/30 font-bold'
                      : 'hover:text-white hover:bg-surface-light'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-saffron' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-heading font-bold text-white bg-saffron hover:bg-saffron-hover rounded-xl shadow-saffron-glow transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Register Team</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
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
        <div className="md:hidden glass-panel border-t border-surface-border px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-saffron/15 text-saffron border border-saffron/30 font-bold'
                      : 'text-slate-200 hover:bg-surface-light'
                  }`}
                >
                  <Icon className="w-4 h-4 text-saffron" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-2 border-t border-surface-border">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-xs font-heading font-bold text-white bg-saffron rounded-xl shadow-saffron-glow"
            >
              <span>Register Team Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
