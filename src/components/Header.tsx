'use client';

import React from 'react';
import { Settings, Sparkles, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { YoutubeIcon } from './icons/YoutubeIcon';
import { ApiSettings } from '@/types';

interface HeaderProps {
  onOpenSettings: () => void;
  apiSettings: ApiSettings;
  onSelectPreset: (preset: 'fireship' | 'mrbeast' | 'aliabdaal') => void;
  isDemoActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  apiSettings,
  onSelectPreset,
  isDemoActive,
}) => {
  const hasYtKey = Boolean(apiSettings.youtubeApiKey?.trim());
  const hasGeminiKey = Boolean(apiSettings.geminiApiKey?.trim());

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/20 ring-1 ring-white/20">
            <YoutubeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">TubePulse Pro</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Revenue & Channel Audit
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">YouTube Monetization, Algorithm & Cadence Testing Studio</p>
          </div>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400">
          <span className="text-[11px] font-medium text-zinc-400 px-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          <button
            onClick={() => onSelectPreset('fireship')}
            className="px-2.5 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition text-xs font-medium"
          >
            @fireship
          </button>
          <button
            onClick={() => onSelectPreset('mrbeast')}
            className="px-2.5 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition text-xs font-medium"
          >
            @MrBeast
          </button>
          <button
            onClick={() => onSelectPreset('aliabdaal')}
            className="px-2.5 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition text-xs font-medium"
          >
            @aliabdaal
          </button>
        </div>

        {/* Settings & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">API Keys</span>
            <div className="flex items-center gap-1 pl-1 border-l border-zinc-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasYtKey ? 'bg-emerald-400' : 'bg-zinc-600'
                }`}
                title={hasYtKey ? 'YouTube API Key Connected' : 'Using Zero-Key Public Scraping'}
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  hasGeminiKey ? 'bg-indigo-400' : 'bg-zinc-600'
                }`}
                title={hasGeminiKey ? 'Gemini AI Connected' : 'Gemini AI Unconfigured'}
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
