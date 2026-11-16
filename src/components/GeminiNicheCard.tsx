'use client';

import React from 'react';
import { GeminiInsights } from '@/types';
import {
  Sparkles,
  Target,
  Layers,
  Flame,
  Users,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface GeminiNicheCardProps {
  insights: GeminiInsights | null;
}

export const GeminiNicheCard: React.FC<GeminiNicheCardProps> = ({ insights }) => {
  if (!insights) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-indigo-500/30 p-6 shadow-2xl">
      {/* Top subtle AI glow */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Gemini AI Strategic Analysis
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Algorithm Dossier
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Deep semantic extraction from titles, descriptions, tags, and outlier view multipliers
            </p>
          </div>
        </div>

        {/* Niche Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-zinc-700/80 flex items-center gap-1.5 text-xs">
            <Target className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-zinc-400">Niche:</span>
            <span className="font-semibold text-white">{insights.niche}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center gap-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-zinc-400">Sub-Niche:</span>
            <span className="font-semibold text-indigo-200">{insights.subNiche}</span>
          </div>
        </div>
      </div>

      {/* Positioning Summary */}
      {insights.channelSummary && (
        <div className="mt-5 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-sm text-zinc-300 leading-relaxed">
          <span className="font-semibold text-indigo-300 mr-1.5">Strategic Positioning:</span>
          {insights.channelSummary}
        </div>
      )}

      {/* Grid: Top Performing Angles & Audience Persona */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Performing Content Angles (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400" />
            Top Performing Content Angles & Algorithms
          </div>

          <div className="space-y-3">
            {insights.topPerformingAngles?.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                        {item.angle}
                      </span>
                      {item.avgMultiplier && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          🔥 {item.avgMultiplier} Avg
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.whyItWorks}</p>
                    {item.exampleVideo && (
                      <div className="text-[11px] text-zinc-400 pt-1 flex items-center gap-1">
                        <span className="text-zinc-400">Example:</span>
                        <span className="italic text-zinc-300 truncate max-w-md">
                          &ldquo;{item.exampleVideo}&rdquo;
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Next Hooks */}
          {insights.recommendedHooks && insights.recommendedHooks.length > 0 && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Next High-Probability Viral Hooks:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {insights.recommendedHooks.map((hook, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/90 text-xs text-zinc-300 font-medium italic flex items-center gap-2"
                  >
                    <span className="text-indigo-400 font-bold shrink-0">#{i + 1}</span>
                    <span className="truncate">{hook}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Audience Persona & Competitor Insights */}
        <div className="space-y-4">
          {/* Audience Persona */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <Users className="w-4 h-4 text-purple-400" />
              Audience Persona
            </div>

            {insights.audiencePersona && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-zinc-400 font-medium block">Target Viewer:</span>
                  <p className="text-zinc-200 mt-0.5 leading-relaxed">
                    {insights.audiencePersona.targetViewer}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-medium block">Value Proposition:</span>
                  <p className="text-purple-300 font-medium mt-0.5">
                    &ldquo;{insights.audiencePersona.valueProposition}&rdquo;
                  </p>
                </div>

                {insights.audiencePersona.painPoints?.length > 0 && (
                  <div>
                    <span className="text-zinc-400 font-medium block">Core Viewer Pain Points:</span>
                    <ul className="mt-1 space-y-1">
                      {insights.audiencePersona.painPoints.map((pain, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-zinc-400 text-[11px]">
                          <span className="text-red-400">•</span>
                          <span>{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Competitor Takeaways */}
          {insights.competitorTakeaways && insights.competitorTakeaways.length > 0 && (
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Competitor Takeaways
              </div>
              <ul className="space-y-2">
                {insights.competitorTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
