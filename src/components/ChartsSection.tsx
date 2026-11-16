'use client';

import React, { useState, useMemo } from 'react';
import { VideoItem } from '@/types';
import { formatCompactNumber, formatCalendarDate } from '@/lib/formatters';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3, ScatterChart as ScatterIcon, Clock, Flame } from 'lucide-react';

interface ChartsSectionProps {
  videos: VideoItem[];
  averageViews: number;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ videos, averageViews }) => {
  const [durationMode, setDurationMode] = useState<'buckets' | 'scatter'>('buckets');

  // 1. Prepare chronological data for Views Over Time
  const viewsOverTimeData = useMemo(() => {
    return [...videos]
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      .map((v) => ({
        id: v.id,
        title: v.title,
        date: formatCalendarDate(v.publishedAt),
        rawDate: v.publishedAt,
        views: v.views,
        isOutlier: v.isOutlier,
        outlierMultiplier: v.outlierMultiplier,
        durationFormatted: v.durationFormatted,
        isShort: v.isShort,
      }));
  }, [videos]);

  // 2. Prepare Duration Buckets for Video Duration vs Views
  const durationBucketsData = useMemo(() => {
    const buckets: Record<string, { label: string; count: number; totalViews: number; order: number }> = {
      shorts: { label: '< 60s (Shorts)', count: 0, totalViews: 0, order: 1 },
      veryShort: { label: '1 - 5 mins', count: 0, totalViews: 0, order: 2 },
      medium: { label: '5 - 15 mins', count: 0, totalViews: 0, order: 3 },
      long: { label: '15 - 30 mins', count: 0, totalViews: 0, order: 4 },
      epic: { label: '30+ mins', count: 0, totalViews: 0, order: 5 },
    };

    videos.forEach((v) => {
      const sec = v.durationSeconds;
      if (sec <= 60 || v.isShort) {
        buckets.shorts.count++;
        buckets.shorts.totalViews += v.views;
      } else if (sec <= 300) {
        buckets.veryShort.count++;
        buckets.veryShort.totalViews += v.views;
      } else if (sec <= 900) {
        buckets.medium.count++;
        buckets.medium.totalViews += v.views;
      } else if (sec <= 1800) {
        buckets.long.count++;
        buckets.long.totalViews += v.views;
      } else {
        buckets.epic.count++;
        buckets.epic.totalViews += v.views;
      }
    });

    return Object.values(buckets)
      .map((b) => ({
        bucket: b.label,
        avgViews: b.count > 0 ? Math.round(b.totalViews / b.count) : 0,
        videoCount: b.count,
      }))
      .filter((b) => b.videoCount > 0);
  }, [videos]);

  // 3. Prepare Scatter Plot Data (Duration minutes vs Views)
  const scatterData = useMemo(() => {
    return videos.map((v) => ({
      durationMinutes: parseFloat((v.durationSeconds / 60).toFixed(1)),
      views: v.views,
      title: v.title,
      isOutlier: v.isOutlier,
      isShort: v.isShort,
      formattedDuration: v.durationFormatted,
    }));
  }, [videos]);

  // Custom Tooltip for Views Over Time
  const CustomTimeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-zinc-900/95 border border-zinc-700/80 p-3 shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-400 text-[11px]">{data.date}</span>
            {data.isOutlier && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> {data.outlierMultiplier}x Avg
              </span>
            )}
          </div>
          <p className="font-semibold text-white line-clamp-2">{data.title}</p>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-zinc-300">
            <span>Views:</span>
            <span className="font-bold text-red-400 text-sm">{formatCompactNumber(data.views)}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>Duration:</span>
            <span>{data.durationFormatted} {data.isShort ? '(Short)' : ''}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Duration Buckets
  const CustomBucketTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-zinc-900/95 border border-zinc-700/80 p-3 shadow-xl backdrop-blur-md text-xs space-y-1 z-50">
          <p className="font-bold text-white">{data.bucket}</p>
          <div className="flex items-center justify-between gap-4 text-zinc-300">
            <span>Average Views:</span>
            <span className="font-bold text-indigo-400">{formatCompactNumber(data.avgViews)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-zinc-400 text-[11px]">
            <span>Uploads:</span>
            <span>{data.videoCount} videos</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Views Over Time */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white">Views Over Time (Past 90 Days)</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Chronological upload trajectory & view velocity</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span className="w-2.5 h-0.5 bg-red-400 rounded-full" /> Views
            </span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span className="w-2.5 h-0.5 bg-dashed bg-amber-400 border-t border-dashed border-amber-400" /> 90d Avg
            </span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={viewsOverTimeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickFormatter={(val) => formatCompactNumber(val)}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTimeTooltip />} />
              <ReferenceLine
                y={averageViews}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Avg: ${formatCompactNumber(averageViews)}`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#viewsFill)"
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Video Duration vs. Views Performance */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Video Duration vs. Views</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Determine optimal video runtime for maximum viewership</p>
          </div>

          {/* Toggle between Buckets & Scatter */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setDurationMode('buckets')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                durationMode === 'buckets'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Buckets</span>
            </button>
            <button
              onClick={() => setDurationMode('scatter')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                durationMode === 'scatter'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ScatterIcon className="w-3.5 h-3.5" />
              <span>Scatter</span>
            </button>
          </div>
        </div>

        <div className="w-full h-72">
          {durationMode === 'buckets' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationBucketsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickFormatter={(val) => formatCompactNumber(val)}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomBucketTooltip />} />
                <Bar dataKey="avgViews" radius={[8, 8, 0, 0]}>
                  {durationBucketsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.avgViews >= averageViews * 1.5
                          ? '#f59e0b'
                          : entry.avgViews >= averageViews
                          ? '#6366f1'
                          : '#3f3f46'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  type="number"
                  dataKey="durationMinutes"
                  name="Duration (mins)"
                  unit="m"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="views"
                  name="Views"
                  tickFormatter={(val) => formatCompactNumber(val)}
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white max-w-xs">{data.title}</p>
                          <div className="flex justify-between text-zinc-300">
                            <span>Duration:</span>
                            <span>{data.formattedDuration}</span>
                          </div>
                          <div className="flex justify-between text-red-400 font-bold">
                            <span>Views:</span>
                            <span>{formatCompactNumber(data.views)}</span>
                          </div>
                          {data.isOutlier && (
                            <span className="inline-block mt-1 text-[10px] text-amber-400 font-bold">
                              🔥 Outlier (&gt;2x avg)
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Videos" data={scatterData} fill="#818cf8">
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`scatter-cell-${index}`}
                      fill={entry.isOutlier ? '#f59e0b' : entry.isShort ? '#a855f7' : '#6366f1'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
