'use client';

import React, { useState, useMemo } from 'react';
import { VideoItem } from '@/types';
import {
  formatCompactNumber,
  formatRelativeDate,
  formatCalendarDate,
} from '@/lib/formatters';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Flame,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Clock,
  Filter,
  Film,
  Zap,
} from 'lucide-react';

interface VideoTableProps {
  videos: VideoItem[];
  averageViews: number;
}

type SortField = 'views' | 'date' | 'multiplier' | 'duration';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'outliers' | 'long' | 'shorts';

export const VideoTable: React.FC<VideoTableProps> = ({
  videos,
  averageViews,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const maxViews = useMemo(() => {
    return Math.max(...videos.map((v) => v.views), 1);
  }, [videos]);

  const outlierCount = useMemo(() => {
    return videos.filter((v) => v.isOutlier).length;
  }, [videos]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedVideos = useMemo(() => {
    return videos
      .filter((video) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = video.title.toLowerCase().includes(q);
          const matchesTags = video.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesTags) return false;
        }

        // Type filter
        if (filterType === 'outliers') return video.isOutlier;
        if (filterType === 'shorts') return video.isShort;
        if (filterType === 'long') return !video.isShort;

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'views') {
          comparison = a.views - b.views;
        } else if (sortField === 'date') {
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        } else if (sortField === 'multiplier') {
          comparison = a.outlierMultiplier - b.outlierMultiplier;
        } else if (sortField === 'duration') {
          comparison = a.durationSeconds - b.durationSeconds;
        }

        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [videos, searchQuery, filterType, sortField, sortOrder]);

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 shadow-xl space-y-5">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Video Performance Catalog
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {filteredAndSortedVideos.length} of {videos.length} videos
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Analyzed videos within the past 90 days. Videos with &gt;2x channel average views are
            tagged as Outliers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800 self-stretch md:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Videos ({videos.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('outliers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'outliers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>Outliers ({outlierCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('long')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap ${
              filterType === 'long'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3 h-3 text-red-400" />
            <span>Long-form</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('shorts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap ${
              filterType === 'shorts'
                ? 'bg-zinc-800 text-purple-300 shadow-sm'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <Zap className="w-3 h-3 text-purple-400" />
            <span>Shorts</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search videos by title, topic, or tags..."
          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Video</th>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Published</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('duration')}
                className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Length</span>
                  {sortField === 'duration' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('views')}
                className="py-3 px-4 cursor-pointer hover:text-white transition whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Views</span>
                  {sortField === 'views' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th className="py-3 px-3 hidden sm:table-cell whitespace-nowrap">Engagement</th>
              <th
                onClick={() => handleSort('multiplier')}
                className="py-3 px-4 cursor-pointer hover:text-white transition text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Performance</span>
                  {sortField === 'multiplier' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredAndSortedVideos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-zinc-500">
                  No videos found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedVideos.map((video) => {
                const viewPercentage = Math.min(100, (video.views / maxViews) * 100);

                return (
                  <tr
                    key={video.id}
                    className={`hover:bg-zinc-800/40 transition group ${
                      video.isOutlier ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    {/* Video Column */}
                    <td className="py-3 px-4 max-w-sm sm:max-w-md">
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-24 sm:w-28 h-14 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/60 shadow">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=320&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[10px] text-zinc-200">
                            {video.durationFormatted}
                          </span>
                        </div>

                        {/* Title and tags */}
                        <div className="flex-1 min-w-0">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-zinc-200 hover:text-white transition line-clamp-2 text-xs sm:text-sm leading-snug group-hover:text-red-400"
                            title={video.title}
                          >
                            {video.title}
                          </a>

                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {video.isShort ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                                Short
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[10px] font-medium border border-zinc-700/60">
                                Long
                              </span>
                            )}

                            {video.isOutlier && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                <Flame className="w-2.5 h-2.5 fill-amber-400" />
                                {video.outlierMultiplier}x Avg
                              </span>
                            )}

                            {video.tags && video.tags.length > 0 && (
                              <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                                #{video.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Published Date */}
                    <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                      <span title={formatCalendarDate(video.publishedAt)}>
                        {formatRelativeDate(video.publishedAt)}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                      {video.durationFormatted}
                    </td>

                    {/* Views & Bar */}
                    <td className="py-3 px-4 min-w-[120px]">
                      <div className="font-bold text-white text-sm">
                        {formatCompactNumber(video.views)}
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1 max-w-[100px]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            video.isOutlier
                              ? 'bg-gradient-to-r from-amber-500 to-red-500'
                              : 'bg-zinc-500'
                          }`}
                          style={{ width: `${viewPercentage}%` }}
                        />
                      </div>
                    </td>

                    {/* Engagement */}
                    <td className="py-3 px-3 hidden sm:table-cell text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1" title="Likes">
                          <ThumbsUp className="w-3 h-3 text-zinc-400" />
                          <span>{formatCompactNumber(video.likes)}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Comments">
                          <MessageSquare className="w-3 h-3 text-zinc-400" />
                          <span>{formatCompactNumber(video.comments)}</span>
                        </span>
                      </div>
                    </td>

                    {/* Multiplier Badge */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {video.isOutlier ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-sm flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {video.outlierMultiplier}x
                          </span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">Viral Outlier</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-end">
                          <span className="text-xs text-zinc-400 font-medium">
                            {video.outlierMultiplier}x
                          </span>
                          <span className="text-[10px] text-zinc-600">Standard</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
