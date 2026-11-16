'use client';

import React, { useState, useEffect } from 'react';
import { ChannelAnalysisResponse, ApiSettings } from '@/types';
import { Header } from '@/components/Header';
import { SettingsModal } from '@/components/SettingsModal';
import { InputBar } from '@/components/InputBar';
import { ChannelHeader } from '@/components/ChannelHeader';
import { KPICards } from '@/components/KPICards';
import { GeminiNicheCard } from '@/components/GeminiNicheCard';
import { ChartsSection } from '@/components/ChartsSection';
import { VideoTable } from '@/components/VideoTable';
import { getMockChannelData } from '@/lib/mockData';
import { downloadMarkdownReport } from '@/lib/markdownExport';
import { AlertCircle, Sparkles } from 'lucide-react';
import { YoutubeIcon } from '@/components/icons/YoutubeIcon';

const STORAGE_KEY = 'tubepulse_api_settings';

export default function HomePage() {
  const [data, setData] = useState<ChannelAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Analyzing channel...');
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    youtubeApiKey: '',
    geminiApiKey: '',
  });

  // Load API keys from localStorage on mount & initialize with Fireship demo preview
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setApiSettings(parsed);
      }
    } catch {
      // LocalStorage access fallback
    }

    // Initialize with Fireship demo data immediately so UI is vibrant right away
    setData(getMockChannelData('fireship'));
  }, []);

  const handleSaveSettings = (newSettings: ApiSettings) => {
    setApiSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async (
    query: string,
    isDemo: boolean = false,
    demoPreset?: 'fireship' | 'mrbeast' | 'aliabdaal'
  ) => {
    setError(null);
    setIsLoading(true);

    if (isDemo || (!query && demoPreset)) {
      setLoadingStep(`Loading demo preset (${demoPreset || 'fireship'})...`);
      setTimeout(() => {
        const mock = getMockChannelData(demoPreset || 'fireship');
        setData(mock);
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      setLoadingStep('Fetching channel data & 90-day uploads from YouTube...');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelQuery: query,
          youtubeApiKey: apiSettings.youtubeApiKey,
          geminiApiKey: apiSettings.geminiApiKey,
          isDemo,
          demoPreset,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze channel.');
      }

      setData(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiSettings={apiSettings}
        onSelectPreset={(preset) => handleAnalyze('', true, preset)}
        isDemoActive={data?.source === 'demo'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search & Channel Input */}
        <section className="space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              YouTube Competitor & Channel Analytics
            </h1>
            <p className="text-sm text-zinc-400">
              Audit 90-day upload rhythms, detect viral outliers, uncover AI-extracted niche strategy, and export markdown reports.
            </p>
          </div>

          <InputBar
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            loadingStep={loadingStep}
            hasApiKey={Boolean(apiSettings.youtubeApiKey)}
          />
        </section>

        {/* Error Alert Banner */}
        {error && (
          <div className="rounded-2xl bg-red-950/40 border border-red-500/40 p-4 flex items-start gap-3 text-red-200 text-sm shadow-xl animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Analysis Error</p>
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs font-semibold underline hover:text-white"
                >
                  Configure API Keys
                </button>
                <button
                  onClick={() => handleAnalyze('', true, 'fireship')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Switch to Demo Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Loaded Content */}
        {data && (
          <div className="space-y-8">
            {/* 1. Channel Profile Header with Markdown Export */}
            <ChannelHeader
              channel={data.channel}
              source={data.source}
              isDemo={data.source === 'demo'}
              onExportMarkdown={() => downloadMarkdownReport(data)}
            />

            {/* 2. KPI Cards */}
            <KPICards kpis={data.kpis} />

            {/* 3. Gemini Strategic AI Niche Dossier */}
            <GeminiNicheCard insights={data.geminiInsights} />

            {/* 4. Interactive Charts Section */}
            <ChartsSection videos={data.videos} averageViews={data.kpis.averageViews} />

            {/* 5. Searchable & Sortable Outlier Video Catalog Table */}
            <VideoTable
              videos={data.videos}
              averageViews={data.kpis.averageViews}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-white">
              <YoutubeIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-300">TubePulse Analytics</span>
            <span>&mdash; Built with Next.js App Router, Tailwind CSS, Recharts & Gemini</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>Past 90-day Horizon</span>
            <span>•</span>
            <span>Outlier Detection (&gt;2x Avg)</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiSettings={apiSettings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
