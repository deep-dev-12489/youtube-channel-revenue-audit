import { NextRequest, NextResponse } from 'next/server';
import {
  fetchChannelFromYouTube,
  fetchPast90DaysVideos,
  calculateKPIs,
  fetchChannelZeroKey,
} from '@/lib/youtube';
import { analyzeChannelWithGemini } from '@/lib/gemini';
import { getMockChannelData } from '@/lib/mockData';

export const maxDuration = 60; // Allow sufficient time for YouTube API + Gemini AI

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      channelQuery,
      youtubeApiKey: clientYtKey,
      geminiApiKey: clientGeminiKey,
      isDemo,
      demoPreset,
    } = body;

    // Check environment variables as fallback
    const ytKey = clientYtKey?.trim() || process.env.YOUTUBE_API_KEY || '';
    const geminiKey = clientGeminiKey?.trim() || process.env.GEMINI_API_KEY || '';

    // If Demo Mode requested or explicit preset
    if (isDemo || !channelQuery) {
      const preset = demoPreset || 'fireship';
      const mockData = getMockChannelData(preset);
      return NextResponse.json(mockData);
    }

    const queryLower = channelQuery.toLowerCase().trim();
    if (
      !ytKey &&
      (queryLower.includes('fireship') ||
        queryLower.includes('mrbeast') ||
        queryLower.includes('aliabdaal') ||
        queryLower.includes('ali abdaal'))
    ) {
      let preset: 'fireship' | 'mrbeast' | 'aliabdaal' = 'fireship';
      if (queryLower.includes('mrbeast')) preset = 'mrbeast';
      if (queryLower.includes('aliabdaal') || queryLower.includes('ali abdaal')) preset = 'aliabdaal';
      return NextResponse.json(getMockChannelData(preset));
    }

    // If no YouTube Data API v3 key provided, use the Public Zero-Key Live Resolver!
    if (!ytKey) {
      try {
        const { channelInfo, videos } = await fetchChannelZeroKey(channelQuery);
        const kpis = calculateKPIs(videos, channelInfo);
        const geminiInsights = await analyzeChannelWithGemini(channelInfo, videos, geminiKey);

        return NextResponse.json({
          channel: channelInfo,
          kpis,
          videos,
          geminiInsights,
          fetchedAt: new Date().toISOString(),
          daysRange: 90,
          source: 'rss',
        });
      } catch (zeroKeyError: any) {
        return NextResponse.json(
          {
            error:
              zeroKeyError.message ||
              'YouTube Data API v3 key is required for live channel analysis. Please add your key in the Settings modal (gear icon), or switch to "Demo Mode" to preview with mock data.',
          },
          { status: 400 }
        );
      }
    }

    // 1. Fetch Channel Info
    const { channelInfo, uploadsPlaylistId } = await fetchChannelFromYouTube(channelQuery, ytKey);

    // 2. Fetch past 90 days videos
    const videos = await fetchPast90DaysVideos(uploadsPlaylistId, ytKey);

    // 3. Compute KPI Metrics
    const kpis = calculateKPIs(videos, channelInfo);

    // 4. Gemini Strategic Analysis
    const geminiInsights = await analyzeChannelWithGemini(channelInfo, videos, geminiKey);

    return NextResponse.json({
      channel: channelInfo,
      kpis,
      videos,
      geminiInsights,
      fetchedAt: new Date().toISOString(),
      daysRange: 90,
      source: 'api',
    });
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return NextResponse.json(
      {
        error: error.message || 'An unexpected error occurred while analyzing the YouTube channel.',
      },
      { status: 500 }
    );
  }
}
