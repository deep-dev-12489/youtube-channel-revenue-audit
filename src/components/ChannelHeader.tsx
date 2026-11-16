'use client';

import React, { useState } from 'react';
import { ChannelInfo } from '@/types';
import { formatCompactNumber } from '@/lib/formatters';
import {
  ExternalLink,
  Users,
  Video,
  Eye,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  FileDown,
} from 'lucide-react';

interface ChannelHeaderProps {
  channel: ChannelInfo;
  source?: 'api' | 'demo' | 'rss';
  isDemo?: boolean;
  onExportMarkdown?: () => void;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channel,
  source,
  isDemo,
  onExportMarkdown,
}) => {
  const [imageError, setImageError] = useState(false);

  const initial = (channel.title || 'Y').charAt(0).toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Avatar + Main Info */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {channel.avatarUrl && !imageError ? (
              <img
                src={channel.avatarUrl}
                alt={channel.title}
                onError={() => setImageError(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-zinc-700 shadow-md bg-zinc-800"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-white shadow-lg ring-2 ring-white/10">
                {initial}
              </div>
            )}
            {isDemo && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950 flex items-center gap-0.5 shadow">
                <Sparkles className="w-2.5 h-2.5" /> Demo
              </span>
            )}
            {source === 'rss' && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center gap-0.5 shadow">
                <Zap className="w-2.5 h-2.5" /> Live
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {channel.title}
              </h1>
              <a
                href={
                  channel.customUrl
                    ? `https://www.youtube.com/${channel.customUrl}`
                    : `https://www.youtube.com/channel/${channel.id}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition"
              >
                <span>{channel.handle}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-zinc-400 mt-1 max-w-2xl line-clamp-2">
              {channel.description || 'No description provided.'}
            </p>

            {/* Badges & Actions */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-red-400" /> Past 90 Days Analysis Window
              </span>

              {source === 'rss' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-950/50 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-medium">
                  <Zap className="w-3 h-3 text-blue-400" /> Live Public Feed (Zero-Key Mode)
                </span>
              )}

              {source === 'api' && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> YouTube Data API v3 Connected
                </span>
              )}

              {channel.country && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                  📍 {channel.country}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats & Export Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 self-stretch md:self-auto border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
          {/* Lifetime Stats Counters */}
          <div className="flex items-center justify-around sm:justify-end gap-4 sm:gap-6">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-1 text-xs text-zinc-400 mb-0.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" /> Subscribers
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {formatCompactNumber(channel.subscriberCount)}
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-1 text-xs text-zinc-400 mb-0.5">
                <Eye className="w-3.5 h-3.5 text-zinc-400" /> Lifetime Views
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {formatCompactNumber(channel.totalViews)}
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-1 text-xs text-zinc-400 mb-0.5">
                <Video className="w-3.5 h-3.5 text-zinc-400" /> Uploads
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {formatCompactNumber(channel.totalVideosCount)}
              </div>
            </div>
          </div>

          {/* Export Markdown Action Button */}
          {onExportMarkdown && (
            <div className="sm:pl-2 flex justify-end">
              <button
                type="button"
                onClick={onExportMarkdown}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition active:scale-95 group cursor-pointer"
                title="Download complete analysis as a Markdown (.md) report"
              >
                <FileDown className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span>Export Report (.md)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
