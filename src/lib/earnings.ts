import { VideoItem, ChannelInfo } from '@/types';

export const USD_TO_INR = 86.5; // Current exchange rate

export interface RevenueEstimate {
  min90d: number;
  max90d: number;
  avgMonthlyMin: number;
  avgMonthlyMax: number;
  rpmAverage: number;
  min90dInr: number;
  max90dInr: number;
  avgMonthlyMinInr: number;
  avgMonthlyMaxInr: number;
}

/**
 * Calculates realistic RPM range based on channel niche, country, and video duration
 */
export function getChannelRpmRange(channel?: Partial<ChannelInfo>): { minRpmLong: number; maxRpmLong: number; rpmShort: number } {
  const country = (channel?.country || '').toUpperCase();
  const desc = ((channel?.description || '') + ' ' + (channel?.title || '')).toLowerCase();

  // High RPM niches (Tech, Finance, Business, Software)
  if (desc.includes('code') || desc.includes('tech') || desc.includes('software') || desc.includes('finance') || desc.includes('crypto')) {
    return { minRpmLong: 3.5, maxRpmLong: 8.5, rpmShort: 0.06 };
  }

  // Productivity & Education
  if (desc.includes('productivity') || desc.includes('book') || desc.includes('study') || desc.includes('education')) {
    return { minRpmLong: 2.5, maxRpmLong: 6.0, rpmShort: 0.05 };
  }

  // Regional music / entertainment (like India / Play DMF / Bollywood)
  if (country === 'IN' || desc.includes('music') || desc.includes('song') || desc.includes('dmf') || desc.includes('hindi')) {
    return { minRpmLong: 0.4, maxRpmLong: 1.5, rpmShort: 0.03 };
  }

  // Broad entertainment / stunts (MrBeast style)
  if (desc.includes('challenge') || desc.includes('stunt') || desc.includes('entertainment')) {
    return { minRpmLong: 1.8, maxRpmLong: 4.5, rpmShort: 0.05 };
  }

  // Default global average
  return { minRpmLong: 1.2, maxRpmLong: 3.2, rpmShort: 0.04 };
}

/**
 * Calculates estimated revenue for a single video
 */
export function calculateVideoEarnings(
  views: number,
  isShort: boolean,
  rpmConfig: { minRpmLong: number; maxRpmLong: number; rpmShort: number }
): { min: number; max: number; minInr: number; maxInr: number } {
  if (views <= 0) return { min: 0, max: 0, minInr: 0, maxInr: 0 };

  const thousands = views / 1000;
  let min = 0;
  let max = 0;

  if (isShort) {
    min = parseFloat((thousands * (rpmConfig.rpmShort * 0.7)).toFixed(2));
    max = parseFloat((thousands * (rpmConfig.rpmShort * 1.4)).toFixed(2));
  } else {
    min = parseFloat((thousands * rpmConfig.minRpmLong).toFixed(2));
    max = parseFloat((thousands * rpmConfig.maxRpmLong).toFixed(2));
  }

  return {
    min: Math.round(min),
    max: Math.round(max),
    minInr: Math.round(min * USD_TO_INR),
    maxInr: Math.round(max * USD_TO_INR),
  };
}

/**
 * Calculates total 90d and monthly estimated earnings across all videos
 */
export function calculateTotalRevenue(
  videos: VideoItem[],
  channel?: Partial<ChannelInfo>
): RevenueEstimate {
  const rpmConfig = getChannelRpmRange(channel);

  let totalMin = 0;
  let totalMax = 0;

  videos.forEach((v) => {
    const { min, max } = calculateVideoEarnings(v.views, v.isShort, rpmConfig);
    totalMin += min;
    totalMax += max;
  });

  const avgMonthlyMin = Math.round(totalMin / 3);
  const avgMonthlyMax = Math.round(totalMax / 3);

  return {
    min90d: Math.round(totalMin),
    max90d: Math.round(totalMax),
    avgMonthlyMin,
    avgMonthlyMax,
    rpmAverage: parseFloat(((rpmConfig.minRpmLong + rpmConfig.maxRpmLong) / 2).toFixed(2)),
    min90dInr: Math.round(totalMin * USD_TO_INR),
    max90dInr: Math.round(totalMax * USD_TO_INR),
    avgMonthlyMinInr: Math.round(avgMonthlyMin * USD_TO_INR),
    avgMonthlyMaxInr: Math.round(avgMonthlyMax * USD_TO_INR),
  };
}
