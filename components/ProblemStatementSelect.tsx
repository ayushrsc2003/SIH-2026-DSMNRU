'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Cpu, Code } from 'lucide-react';
import sihProblemStatements from '@/data/sihProblemStatements.json';

export interface ProblemStatementOption {
  psCode: string;
  title: string;
  category: string;
  domain: string;
}

interface ProblemStatementSelectProps {
  selectedPsCode: string;
  onSelect: (ps: ProblemStatementOption) => void;
}

export default function ProblemStatementSelect({ selectedPsCode, onSelect }: ProblemStatementSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPs = sihProblemStatements.find((ps) => ps.psCode === selectedPsCode) || null;

  // Filter options based on PS Code or Title
  const filteredOptions = sihProblemStatements.filter((ps) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return ps.psCode.toLowerCase().includes(q) || ps.title.toLowerCase().includes(q) || ps.domain.toLowerCase().includes(q);
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
        Official SIH Problem Statement <span className="text-saffron">*</span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-surface-border text-left flex items-center justify-between focus:outline-none focus:border-saffron transition-colors"
      >
        {selectedPs ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-saffron/20 text-saffron border border-saffron/40 shrink-0">
              {selectedPs.psCode}
            </span>
            <span className="text-sm font-sans text-white truncate">{selectedPs.title}</span>
          </div>
        ) : (
          <span className="text-sm font-sans text-slate-400">Search and select SIH Problem Statement...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl glass-panel border border-surface-border shadow-2xl p-3 space-y-3 max-h-80 overflow-y-auto">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by PS Code (e.g. SIH1601) or title keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-900 border border-surface-border text-white text-xs focus:outline-none focus:border-saffron"
              autoFocus
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* Options List */}
          <div className="space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-500">
                No matching SIH problem statements found.
              </div>
            ) : (
              filteredOptions.map((ps) => {
                const isSelected = selectedPsCode === ps.psCode;
                const isHardware = ps.category.toLowerCase() === 'hardware';
                return (
                  <button
                    key={ps.psCode}
                    type="button"
                    onClick={() => {
                      onSelect(ps);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-start justify-between space-x-3 ${
                      isSelected
                        ? 'bg-saffron/20 border border-saffron/40 text-white'
                        : 'hover:bg-surface-light text-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-saffron">{ps.psCode}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded border flex items-center space-x-1 ${
                          isHardware ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-accentGreen/20 text-accentGreen border-accentGreen/40'
                        }`}>
                          {isHardware ? <Cpu className="w-3 h-3 inline" /> : <Code className="w-3 h-3 inline" />}
                          <span>{ps.category}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">[{ps.domain}]</span>
                      </div>
                      <p className="text-xs font-sans font-medium text-slate-200 leading-snug">{ps.title}</p>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-saffron shrink-0 mt-1" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
