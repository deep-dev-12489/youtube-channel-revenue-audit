'use client';

import React, { useState } from 'react';
import { KPIData } from '@/types';
import { formatCompactNumber, formatCurrency } from '@/lib/formatters';
import {
  Film,
  CalendarDays,
  Clock,
  Eye,
  PieChart,
  DollarSign,
  Coins,
  TrendingUp,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';

interface KPICardsProps {
  kpis: KPIData;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const [activeTab, setActiveTab] = useState<'cadence' | 'revenue' | 'all'>('all');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  const rev = kpis.estimatedRevenue || {
    min90d: 0,
    max90d: 0,
    avgMonthlyMin: 0,
    avgMonthlyMax: 0,
    rpmAverage: 1.5,
    min90dInr: 0,
    max90dInr: 0,
    avgMonthlyMinInr: 0,
    avgMonthlyMaxInr: 0,
  };

  const min90d = currency === 'USD' ? rev.min90d : rev.min90dInr;
  const max90d = currency === 'USD' ? rev.max90d : rev.max90dInr;
  const monthlyMin = currency === 'USD' ? rev.avgMonthlyMin : rev.avgMonthlyMinInr;
  const monthlyMax = currency === 'USD' ? rev.avgMonthlyMax : rev.avgMonthlyMaxInr;
  const avgRevPerVid = kpis.totalVideos90d > 0 ? Math.round((min90d + max90d) / (2 * kpis.totalVideos90d)) : 0;
  const rpmDisplay = currency === 'USD' ? `$${rev.rpmAverage}` : `₹${Math.round(rev.rpmAverage * 86.5)}`;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Complete Audit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cadence')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'cadence'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload Cadence ({kpis.totalVideos90d} vids)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'revenue'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Revenue Audit</span>
          </button>
        </div>

        {/* Currency Switcher (Shown when Revenue is in view) */}
        {(activeTab === 'revenue' || activeTab === 'all') && (
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl text-xs self-end sm:self-auto">
            <span className="text-[11px] text-zinc-400 pl-2 pr-1 flex items-center gap-1 font-medium">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Currency:
            </span>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                currency === 'USD'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                currency === 'INR'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
          </div>
        )}
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* === SECTION A: MONETIZATION & REVENUE AUDIT CARDS === */}
        {(activeTab === 'revenue' || activeTab === 'all') && (
          <>
            {/* Card 1: Estimated 90-Day Revenue */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-950/50 via-zinc-900/90 to-zinc-900/90 border border-emerald-500/30 p-5 shadow-lg group hover:border-emerald-500/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  Est. 90d Ad Revenue
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {formatCurrency(min90d, currency)} – {formatCurrency(max90d, currency)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Based on 90-day active catalog</div>
              </div>

              <div className="mt-3 pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Monthly Run-rate:</span>
                <span className="font-semibold text-emerald-300">
                  {formatCurrency(monthlyMin, currency)}–{formatCurrency(monthlyMax, currency)}/mo
                </span>
              </div>
            </div>

            {/* Card 2: Modeled Niche RPM */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-950/30 via-zinc-900/90 to-zinc-900/90 border border-emerald-500/20 p-5 shadow-lg group hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Niche RPM Benchmark
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Coins className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {rpmDisplay}
                </span>
                <span className="text-xs text-zinc-400 font-medium">/ 1,000 views</span>
              </div>

              <div className="mt-3 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Avg Revenue Per Vid:</span>
                <span className="text-white font-semibold">{formatCurrency(avgRevPerVid, currency)}</span>
              </div>
            </div>
          </>
        )}

        {/* === SECTION B: CADENCE & PERFORMANCE AUDIT CARDS === */}
        {(activeTab === 'cadence' || activeTab === 'all') && (
          <>
            {/* Card 3: Total Uploads (90d) */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg group hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Total Videos
                </span>
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <Film className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {kpis.totalVideos90d}
                </span>
                <span className="text-xs text-zinc-400 font-medium">videos / 90d</span>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Active 90d catalog testing horizon</span>
              </div>
            </div>

            {/* Card 4: Weekly Upload Frequency */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg group hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Weekly Pace
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {kpis.weeklyUploadFrequency}
                </span>
                <span className="text-xs text-zinc-400 font-medium">vids / week</span>
              </div>

              <div className="mt-3 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>
                  {kpis.weeklyUploadFrequency >= 3
                    ? '🔥 High output pace'
                    : kpis.weeklyUploadFrequency >= 1
                    ? '⚡ Consistent weekly'
                    : '🐢 Low frequency'}
                </span>
              </div>
            </div>

            {/* Card 5: Average Upload Gap */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg group hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Avg Upload Gap
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {kpis.averageUploadGapDays}
                </span>
                <span className="text-xs text-zinc-400 font-medium">days</span>
              </div>

              <div className="mt-3 text-[11px] text-zinc-400">
                <span>Between consecutive uploads</span>
              </div>
            </div>

            {/* Card 6: Average Views */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg group hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Average Views
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {formatCompactNumber(kpis.averageViews)}
                </span>
                <span className="text-xs text-zinc-400 font-medium">/ video</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Median: {formatCompactNumber(kpis.medianViews)}</span>
                <span className="text-emerald-400 font-medium">90d Baseline</span>
              </div>
            </div>

            {/* Card 7: Shorts vs. Long-form Ratio */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg group hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Shorts vs Long
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <PieChart className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {kpis.longPercentage}%
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase">Long</span>
                </div>
                <span className="text-xs text-zinc-600">/</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-purple-400">
                    {kpis.shortsPercentage}%
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase">Shorts</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${kpis.longPercentage}%` }}
                  title={`Long-form: ${kpis.longCount} videos (${kpis.longPercentage}%)`}
                />
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${kpis.shortsPercentage}%` }}
                  title={`Shorts: ${kpis.shortsCount} videos (${kpis.shortsPercentage}%)`}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
