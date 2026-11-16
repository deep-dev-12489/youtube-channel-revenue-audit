import { ChannelInfo, KPIData, VideoItem } from '@/types';
import { calculateTotalRevenue, calculateVideoEarnings, getChannelRpmRange } from './earnings';

/**
 * Parses an ISO 8601 duration string (e.g., "PT15M33S", "PT58S", "PT1H2M10S") into seconds.
 */
export function parseISO8601Duration(duration: string): number {
  if (!duration) return 0;
  
  const regex = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);
  if (!matches) return 0;

  const days = parseInt(matches[1] || '0', 10);
  const hours = parseInt(matches[2] || '0', 10);
  const minutes = parseInt(matches[3] || '0', 10);
  const seconds = parseInt(matches[4] || '0', 10);

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, '0');
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}

/**
 * Extracts a channel handle, ID, or search username from various user inputs
 * Supports:
 * - @handle or handle
 * - https://www.youtube.com/@handle
 * - https://www.youtube.com/channel/UCxxxxxxxxx
 * - https://www.youtube.com/c/customName
 * - UCxxxxxxxxxxxxxxxxxxxxxx (24 chars channel ID)
 */
export function parseChannelInput(input: string): { type: 'handle' | 'id' | 'username' | 'search'; value: string } {
  const trimmed = input.trim();

  // Channel ID direct (starts with UC and around 24 chars)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: 'id', value: trimmed };
  }

  // URL parsing
  if (trimmed.includes('youtube.com/') || trimmed.includes('youtu.be/')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const pathname = url.pathname;

      // /@handle
      const handleMatch = pathname.match(/@([a-zA-Z0-9_.-]+)/);
      if (handleMatch) {
        return { type: 'handle', value: `@${handleMatch[1]}` };
      }

      // /channel/UC...
      const channelMatch = pathname.match(/\/channel\/(UC[\w-]{22})/);
      if (channelMatch) {
        return { type: 'id', value: channelMatch[1] };
      }

      // /c/username or /user/username
      const customMatch = pathname.match(/\/(c|user)\/([a-zA-Z0-9_.-]+)/);
      if (customMatch) {
        return { type: 'username', value: customMatch[2] };
      }

      // Fallback path segment
      const cleanSegments = pathname.split('/').filter(Boolean);
      if (cleanSegments.length > 0) {
        const lastSegment = cleanSegments[cleanSegments.length - 1];
        if (lastSegment.startsWith('@')) {
          return { type: 'handle', value: lastSegment };
        }
        return { type: 'search', value: lastSegment };
      }
    } catch {
      // Not a valid URL, fall through
    }
  }

  // If starts with @
  if (trimmed.startsWith('@')) {
    return { type: 'handle', value: trimmed };
  }

  // If looks like handle without @ (alphanumeric with underscores, hyphens, dots)
  if (/^[a-zA-Z0-9_.-]{3,30}$/.test(trimmed)) {
    return { type: 'handle', value: `@${trimmed}` };
  }

  return { type: 'search', value: trimmed };
}

/**
 * Calculates all KPI metrics for the videos in past 90 days
 */
export function calculateKPIs(videos: VideoItem[], channel?: Partial<ChannelInfo>): KPIData {
  const totalVideos90d = videos.length;
  const estimatedRevenue = calculateTotalRevenue(videos, channel);

  if (totalVideos90d === 0) {
    return {
      totalVideos90d: 0,
      weeklyUploadFrequency: 0,
      averageUploadGapDays: 0,
      averageViews: 0,
      medianViews: 0,
      totalViews90d: 0,
      totalLikes90d: 0,
      totalComments90d: 0,
      shortsCount: 0,
      longCount: 0,
      shortsPercentage: 0,
      longPercentage: 0,
      outlierCount: 0,
      outlierRate: 0,
      highestViews: 0,
      lowestViews: 0,
      estimatedRevenue,
    };
  }

  // Views & statistics sums
  const totalViews90d = videos.reduce((acc, v) => acc + v.views, 0);
  const totalLikes90d = videos.reduce((acc, v) => acc + v.likes, 0);
  const totalComments90d = videos.reduce((acc, v) => acc + v.comments, 0);
  const averageViews = Math.round(totalViews90d / totalVideos90d);

  // Median views
  const sortedViews = [...videos].map((v) => v.views).sort((a, b) => a - b);
  const mid = Math.floor(sortedViews.length / 2);
  const medianViews =
    sortedViews.length % 2 !== 0
      ? sortedViews[mid]
      : Math.round((sortedViews[mid - 1] + sortedViews[mid]) / 2);

  const highestViews = sortedViews[sortedViews.length - 1] || 0;
  const lowestViews = sortedViews[0] || 0;

  // Shorts vs Long-form
  const shortsCount = videos.filter((v) => v.isShort).length;
  const longCount = totalVideos90d - shortsCount;
  const shortsPercentage = Math.round((shortsCount / totalVideos90d) * 100);
  const longPercentage = 100 - shortsPercentage;

  // Weekly upload frequency: (Total Videos in 90 days) / (90 / 7 weeks) = Total / 12.857
  const weeksInRange = 90 / 7; // ~12.86 weeks
  const weeklyUploadFrequency = parseFloat((totalVideos90d / weeksInRange).toFixed(1));

  // Average upload gap in days between consecutive videos
  // Sort ascending by date
  const sortedByDateAsc = [...videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  let averageUploadGapDays = 0;
  if (sortedByDateAsc.length > 1) {
    let totalGapDays = 0;
    for (let i = 1; i < sortedByDateAsc.length; i++) {
      const prevDate = new Date(sortedByDateAsc[i - 1].publishedAt).getTime();
      const currDate = new Date(sortedByDateAsc[i].publishedAt).getTime();
      const gapDays = Math.abs(currDate - prevDate) / (1000 * 60 * 60 * 24);
      totalGapDays += gapDays;
    }
    averageUploadGapDays = parseFloat(
      (totalGapDays / (sortedByDateAsc.length - 1)).toFixed(1)
    );
  }

  // Outliers (> 2x channel average views)
  const outlierThreshold = averageViews * 2;
  const outlierVideos = videos.filter((v) => v.views > outlierThreshold);
  const outlierCount = outlierVideos.length;
  const outlierRate = parseFloat(((outlierCount / totalVideos90d) * 100).toFixed(1));

  return {
    totalVideos90d,
    weeklyUploadFrequency,
    averageUploadGapDays,
    averageViews,
    medianViews,
    totalViews90d,
    totalLikes90d,
    totalComments90d,
    shortsCount,
    longCount,
    shortsPercentage,
    longPercentage,
    outlierCount,
    outlierRate,
    highestViews,
    lowestViews,
    estimatedRevenue,
  };
}

/**
 * Marks outlier status (>2x avg) and assigns outlier multipliers & estimated video earnings
 */
export function enrichVideosWithOutliers(
  videos: VideoItem[],
  avgViews: number,
  channel?: Partial<ChannelInfo>
): VideoItem[] {
  const threshold = avgViews * 2;
  const rpmConfig = getChannelRpmRange(channel);

  return videos.map((video) => {
    const isOutlier = avgViews > 0 && video.views >= threshold;
    const outlierMultiplier =
      avgViews > 0 ? parseFloat((video.views / avgViews).toFixed(2)) : 1;
    const estimatedRevenue = calculateVideoEarnings(video.views, video.isShort, rpmConfig);

    return {
      ...video,
      isOutlier,
      outlierMultiplier,
      estimatedRevenue,
    };
  });
}

/**
 * Fetch Channel from YouTube API v3
 */
export async function fetchChannelFromYouTube(
  input: string,
  apiKey: string
): Promise<{ channelInfo: ChannelInfo; uploadsPlaylistId: string }> {
  const parsed = parseChannelInput(input);
  const baseUrl = 'https://www.googleapis.com/youtube/v3';

  let channelUrl = '';

  if (parsed.type === 'id') {
    channelUrl = `${baseUrl}/channels?part=snippet,contentDetails,statistics&id=${parsed.value}&key=${apiKey}`;
  } else if (parsed.type === 'handle') {
    const cleanHandle = parsed.value.startsWith('@') ? parsed.value : `@${parsed.value}`;
    channelUrl = `${baseUrl}/channels?part=snippet,contentDetails,statistics&forHandle=${encodeURIComponent(
      cleanHandle
    )}&key=${apiKey}`;
  } else if (parsed.type === 'username') {
    channelUrl = `${baseUrl}/channels?part=snippet,contentDetails,statistics&forUsername=${encodeURIComponent(
      parsed.value
    )}&key=${apiKey}`;
  } else {
    // Search for channel by query
    const searchUrl = `${baseUrl}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(
      parsed.value
    )}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const err = await searchRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `YouTube Search API error: ${searchRes.statusText}`);
    }
    const searchData = await searchRes.json();
    if (!searchData.items || searchData.items.length === 0) {
      throw new Error(`No YouTube channel found matching "${parsed.value}"`);
    }
    const channelId = searchData.items[0].snippet?.channelId || searchData.items[0].id?.channelId;
    channelUrl = `${baseUrl}/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${apiKey}`;
  }

  const res = await fetch(channelUrl);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `YouTube Channels API error: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    // If handle search failed, try fallback search
    if (parsed.type === 'handle') {
      const fallbackSearchUrl = `${baseUrl}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(
        parsed.value
      )}&key=${apiKey}`;
      const searchRes = await fetch(fallbackSearchUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.items && searchData.items.length > 0) {
          const fallbackId = searchData.items[0].snippet?.channelId || searchData.items[0].id?.channelId;
          const fallbackRes = await fetch(
            `${baseUrl}/channels?part=snippet,contentDetails,statistics&id=${fallbackId}&key=${apiKey}`
          );
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            if (fbData.items && fbData.items.length > 0) {
              return extractChannelData(fbData.items[0]);
            }
          }
        }
      }
    }
    throw new Error(`Channel "${parsed.value}" not found on YouTube.`);
  }

  return extractChannelData(data.items[0]);
}

function extractChannelData(item: any): { channelInfo: ChannelInfo; uploadsPlaylistId: string } {
  const snippet = item.snippet || {};
  const stats = item.statistics || {};
  const contentDetails = item.contentDetails || {};

  const uploadsPlaylistId = contentDetails.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error('Could not find uploads playlist for this channel.');
  }

  const channelInfo: ChannelInfo = {
    id: item.id,
    title: snippet.title || 'Unknown Channel',
    handle: snippet.customUrl || `@${item.id}`,
    description: snippet.description || '',
    customUrl: snippet.customUrl,
    avatarUrl:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      '',
    bannerUrl: item.brandingSettings?.image?.bannerExternalUrl,
    subscriberCount: parseInt(stats.subscriberCount || '0', 10),
    totalViews: parseInt(stats.viewCount || '0', 10),
    totalVideosCount: parseInt(stats.videoCount || '0', 10),
    publishedAt: snippet.publishedAt,
    country: snippet.country,
  };

  return { channelInfo, uploadsPlaylistId };
}

/**
 * Fetch all videos uploaded by the channel in the past 90 days
 */
export async function fetchPast90DaysVideos(
  uploadsPlaylistId: string,
  apiKey: string
): Promise<VideoItem[]> {
  const baseUrl = 'https://www.googleapis.com/youtube/v3';
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const ninetyDaysIso = ninetyDaysAgo.toISOString();

  let playlistVideoItems: Array<{ videoId: string; publishedAt: string; title: string }> = [];
  let nextPageToken: string | undefined = undefined;
  let reachedOlder = false;

  // 1. Fetch playlist items page by page until older than 90 days
  do {
    let url = `${baseUrl}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
    if (nextPageToken) {
      url += `&pageToken=${nextPageToken}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch uploads playlist: ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    if (items.length === 0) break;

    for (const item of items) {
      const publishedAt = item.snippet?.publishedAt || item.contentDetails?.videoPublishedAt;
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;

      if (!videoId) continue;

      if (publishedAt) {
        const itemDate = new Date(publishedAt);
        if (itemDate < ninetyDaysAgo) {
          // Reached videos older than 90 days
          reachedOlder = true;
          break;
        }
      }

      playlistVideoItems.push({
        videoId,
        publishedAt: publishedAt || new Date().toISOString(),
        title: item.snippet?.title || '',
      });
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken && !reachedOlder && playlistVideoItems.length < 500);

  if (playlistVideoItems.length === 0) {
    return [];
  }

  // 2. Fetch full video statistics and duration in chunks of 50
  const videoIds = playlistVideoItems.map((v) => v.videoId);
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  const enrichedVideos: VideoItem[] = [];

  for (const chunk of chunks) {
    const videosUrl = `${baseUrl}/videos?part=snippet,contentDetails,statistics&id=${chunk.join(
      ','
    )}&key=${apiKey}`;
    const res = await fetch(videosUrl);
    if (!res.ok) {
      continue;
    }

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      const durationIso = item.contentDetails?.duration || 'PT0S';
      const durationSeconds = parseISO8601Duration(durationIso);
      const isShort = durationSeconds <= 60 || item.snippet?.title?.toLowerCase().includes('#shorts');
      const views = parseInt(item.statistics?.viewCount || '0', 10);
      const likes = parseInt(item.statistics?.likeCount || '0', 10);
      const comments = parseInt(item.statistics?.commentCount || '0', 10);

      enrichedVideos.push({
        id: item.id,
        title: item.snippet?.title || 'Untitled',
        description: item.snippet?.description || '',
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        thumbnail:
          item.snippet?.thumbnails?.maxres?.url ||
          item.snippet?.thumbnails?.standard?.url ||
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
        duration: durationIso,
        durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        isShort,
        views,
        likes,
        comments,
        tags: item.snippet?.tags || [],
        url: `https://www.youtube.com/watch?v=${item.id}`,
        isOutlier: false, // Calculated after calculating average
        outlierMultiplier: 1,
      });
    }
  }

  // Calculate avg views and enrich outlier flags
  const totalViews = enrichedVideos.reduce((acc, v) => acc + v.views, 0);
  const avgViews = enrichedVideos.length > 0 ? Math.round(totalViews / enrichedVideos.length) : 0;

  return enrichVideosWithOutliers(enrichedVideos, avgViews);
}

/**
 * Fallback live resolver that fetches public YouTube channel info & RSS video feed
 * with ZERO API key required.
 */
export async function fetchChannelZeroKey(
  input: string
): Promise<{ channelInfo: ChannelInfo; videos: VideoItem[] }> {
  // Clean input and strip tracking query parameters (e.g., ?si=..., ?feature=...)
  let clean = input.trim();
  try {
    if (clean.includes('?')) {
      const u = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
      clean = `${u.origin}${u.pathname}`;
    }
  } catch {}

  let channelId = '';

  // 1. Resolve channel ID
  if (/^UC[\w-]{22}$/.test(clean)) {
    channelId = clean;
  } else {
    const cMatch = clean.match(/\/channel\/(UC[\w-]{22})/);
    if (cMatch) {
      channelId = cMatch[1];
    } else {
      let fetchUrl = clean;
      if (!fetchUrl.startsWith('http')) {
        fetchUrl = fetchUrl.startsWith('@')
          ? `https://www.youtube.com/${fetchUrl}`
          : `https://www.youtube.com/@${fetchUrl}`;
      }
      try {
        const pageRes = await fetch(fetchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        const html = await pageRes.text();
        const idMatch =
          html.match(/channel_id=([a-zA-Z0-9_-]{20,28})/) ||
          html.match(/"externalId":"([^"]+)"/);
        if (idMatch) {
          channelId = idMatch[1];
        }
      } catch (e) {
        console.error('Failed to resolve handle to channel ID:', e);
      }
    }
  }

  if (!channelId) {
    throw new Error(
      `Could not resolve YouTube channel from "${input}". Please check the URL or provide a YouTube Data API v3 key.`
    );
  }

  // 2. Fetch Channel Metadata and Videos directly from public HTML (/videos)
  let title = 'YouTube Channel';
  let avatar = '';
  let description = '';
  let subscriberCount = 0;
  let rawVideos: VideoItem[] = [];

  try {
    const pageUrl = `https://www.youtube.com/channel/${channelId}/videos`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = await pageRes.text();

    const tMatch =
      html.match(/<meta property="og:title" content="([^"]+)"/) ||
      html.match(/<title>([^<]+)<\/title>/);
    if (tMatch) {
      title = tMatch[1].replace(' - YouTube', '').trim();
    }

    const aMatch =
      html.match(/<meta property="og:image" content="([^"]+)"/) ||
      html.match(/"avatar":{"thumbnails":\[{"url":"([^"]+)"/);
    if (aMatch) {
      avatar = aMatch[1];
    }

    const dMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    if (dMatch) {
      description = dMatch[1];
    }

    const subsRegex = /([0-9.]+)\s*([kmbKMB]|million|billion)?\s*subscribers/i;
    const subsMatch = html.match(subsRegex);
    if (subsMatch) {
      const num = parseFloat(subsMatch[1]);
      const unit = (subsMatch[2] || '').toLowerCase();
      if (unit.startsWith('m')) subscriberCount = Math.round(num * 1_000_000);
      else if (unit.startsWith('k')) subscriberCount = Math.round(num * 1_000);
      else if (unit.startsWith('b')) subscriberCount = Math.round(num * 1_000_000_000);
      else subscriberCount = Math.round(num);
    }

    // Try extracting from ytInitialData
    const m =
      html.match(/var ytInitialData = ({.*?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({.*?});/);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const lockups: any[] = [];
        const videoRenderers: any[] = [];

        function search(obj: any) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.lockupViewModel) lockups.push(obj.lockupViewModel);
          if (obj.videoRenderer) videoRenderers.push(obj.videoRenderer);
          for (const k of Object.keys(obj)) search(obj[k]);
        }
        search(data);

        // Process lockupViewModels (YouTube 2025/2026 format)
        for (const lk of lockups) {
          const videoId =
            lk.contentId ||
            lk.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
          if (!videoId) continue;

          const vTitle =
            lk.metadata?.lockupMetadataViewModel?.title?.content ||
            lk.rendererContext?.accessibilityContext?.label?.split(' by ')[0] ||
            'Untitled';

          const thumbnail =
            lk.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          const metadataRows =
            lk.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];

          let views = 0;
          let publishedAt = new Date().toISOString();

          for (const row of metadataRows) {
            for (const part of row.metadataParts || []) {
              const text = part.text?.content || '';
              const accessLabel = part.accessibilityLabel || '';

              if (accessLabel.toLowerCase().includes('views') || text.toLowerCase().includes('views')) {
                const vMatch = (accessLabel || text).match(/([0-9.,]+)\s*([kmbKMB]|million|billion)?/i);
                if (vMatch) {
                  const num = parseFloat(vMatch[1].replace(/,/g, ''));
                  const unit = (vMatch[2] || '').toLowerCase();
                  if (unit.startsWith('m')) views = Math.round(num * 1_000_000);
                  else if (unit.startsWith('k')) views = Math.round(num * 1_000);
                  else if (unit.startsWith('b')) views = Math.round(num * 1_000_000_000);
                  else views = Math.round(num);
                }
              }

              if (accessLabel.toLowerCase().includes('ago') || text.toLowerCase().includes('ago')) {
                const agoMatch = (accessLabel || text).match(/(\d+)\s*(hour|day|week|month|year)s?\s*ago/i);
                if (agoMatch) {
                  const amount = parseInt(agoMatch[1], 10);
                  const unit = agoMatch[2].toLowerCase();
                  const d = new Date();
                  if (unit === 'hour') d.setHours(d.getHours() - amount);
                  else if (unit === 'day') d.setDate(d.getDate() - amount);
                  else if (unit === 'week') d.setDate(d.getDate() - amount * 7);
                  else if (unit === 'month') d.setMonth(d.getMonth() - amount);
                  else if (unit === 'year') d.setFullYear(d.getFullYear() - amount);
                  publishedAt = d.toISOString();
                }
              }
            }
          }

          let durationFormatted = '3:00';
          let durationSeconds = 180;
          const badgeText =
            lk.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.text;
          if (badgeText && badgeText.includes(':')) {
            durationFormatted = badgeText;
            const parts = badgeText.split(':').map((p: string) => parseInt(p, 10));
            if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
            if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }

          const isShort = durationSeconds <= 60 || vTitle.toLowerCase().includes('#shorts');

          rawVideos.push({
            id: videoId,
            title: vTitle,
            description: '',
            publishedAt,
            thumbnail,
            duration: isShort ? 'PT45S' : 'PT3M30S',
            durationSeconds,
            durationFormatted,
            isShort,
            views,
            likes: Math.round(views * 0.04),
            comments: Math.round(views * 0.005),
            tags: [],
            url: `https://www.youtube.com/watch?v=${videoId}`,
            isOutlier: false,
            outlierMultiplier: 1,
          });
        }

        // Also process standard videoRenderers if lockups weren't found
        if (rawVideos.length === 0 && videoRenderers.length > 0) {
          for (const vr of videoRenderers) {
            const videoId = vr.videoId;
            if (!videoId) continue;
            const vTitle = vr.title?.runs?.[0]?.text || vr.title?.simpleText || 'Untitled';
            const viewsText = vr.viewCountText?.simpleText || vr.viewCountText?.runs?.[0]?.text || '';
            let views = 0;
            const vMatch = viewsText.match(/([0-9.,]+)\s*([kmbKMB]|million|billion)?/i);
            if (vMatch) {
              const num = parseFloat(vMatch[1].replace(/,/g, ''));
              const unit = (vMatch[2] || '').toLowerCase();
              if (unit.startsWith('m')) views = Math.round(num * 1_000_000);
              else if (unit.startsWith('k')) views = Math.round(num * 1_000);
              else if (unit.startsWith('b')) views = Math.round(num * 1_000_000_000);
              else views = Math.round(num);
            }
            const durationFormatted = vr.lengthText?.simpleText || '3:00';
            let durationSeconds = 180;
            if (durationFormatted.includes(':')) {
              const parts = durationFormatted.split(':').map((p: string) => parseInt(p, 10));
              if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
              if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
            const isShort = durationSeconds <= 60 || vTitle.toLowerCase().includes('#shorts');

            rawVideos.push({
              id: videoId,
              title: vTitle,
              description: '',
              publishedAt: new Date().toISOString(),
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              duration: isShort ? 'PT45S' : 'PT3M30S',
              durationSeconds,
              durationFormatted,
              isShort,
              views,
              likes: Math.round(views * 0.04),
              comments: Math.round(views * 0.005),
              tags: [],
              url: `https://www.youtube.com/watch?v=${videoId}`,
              isOutlier: false,
              outlierMultiplier: 1,
            });
          }
        }
      } catch (parseErr) {
        console.error('ytInitialData parse error:', parseErr);
      }
    }
  } catch (e) {
    console.error('Channel page scrape error:', e);
  }

  // 2b. Also fetch YouTube Shorts if channel is Shorts-first or has few long videos
  if (rawVideos.length < 15) {
    try {
      const shortsUrl = `https://www.youtube.com/channel/${channelId}/shorts`;
      const shortsRes = await fetch(shortsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const shortsHtml = await shortsRes.text();
      const sm =
        shortsHtml.match(/var ytInitialData = ({.*?});<\/script>/) ||
        shortsHtml.match(/ytInitialData\s*=\s*({.*?});/);
      if (sm) {
        const sData = JSON.parse(sm[1]);
        const shortsItems: any[] = [];
        function searchShorts(obj: any) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.shortsLockupViewModel) shortsItems.push(obj.shortsLockupViewModel);
          if (obj.reelItemRenderer) shortsItems.push(obj.reelItemRenderer);
          for (const k of Object.keys(obj)) searchShorts(obj[k]);
        }
        searchShorts(sData);

        for (const item of shortsItems) {
          const videoId =
            item.videoId ||
            item.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId ||
            item.entityId?.replace('shorts-shelf-item-', '');
          if (!videoId || rawVideos.some((v) => v.id === videoId)) continue;

          const vTitle =
            item.overlayMetadata?.primaryText?.content ||
            item.headline?.simpleText ||
            item.accessibilityText?.split(',')[0] ||
            'Short Video';

          let views = 0;
          const viewText =
            item.overlayMetadata?.secondaryText?.content ||
            item.viewCountText?.simpleText ||
            item.accessibilityText ||
            '';
          const vMatch =
            viewText.match(/([0-9.,]+)\s*([kmbKMB]|million|billion)?\s*views/i) ||
            viewText.match(/([0-9.,]+)\s*([kmbKMB]|million|billion)?/i);
          if (vMatch) {
            const num = parseFloat(vMatch[1].replace(/,/g, ''));
            const unit = (vMatch[2] || '').toLowerCase();
            if (unit.startsWith('m')) views = Math.round(num * 1_000_000);
            else if (unit.startsWith('k')) views = Math.round(num * 1_000);
            else if (unit.startsWith('b')) views = Math.round(num * 1_000_000_000);
            else views = Math.round(num);
          }

          const thumbnail =
            item.thumbnailViewModel?.thumbnailViewModel?.image?.sources?.[0]?.url ||
            item.thumbnail?.thumbnails?.[0]?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          rawVideos.push({
            id: videoId,
            title: vTitle,
            description: '',
            publishedAt: new Date().toISOString(),
            thumbnail,
            duration: 'PT35S',
            durationSeconds: 35,
            durationFormatted: '0:35',
            isShort: true,
            views,
            likes: Math.round(views * 0.05),
            comments: Math.round(views * 0.008),
            tags: [],
            url: `https://www.youtube.com/shorts/${videoId}`,
            isOutlier: false,
            outlierMultiplier: 1,
          });
        }
      }
    } catch (shortsErr) {
      console.error('Shorts fetch error:', shortsErr);
    }
  }

  // 3. Fallback to RSS Feed if HTML scrape had 0 videos
  if (rawVideos.length === 0) {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const rssRes = await fetch(rssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (rssRes.ok) {
        const rssText = await rssRes.text();
        const entries = rssText.split('<entry>').slice(1);

        for (const entry of entries) {
          const videoId =
            (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
          if (!videoId) continue;
          const vTitle = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || 'Untitled';
          const publishedAt =
            (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || new Date().toISOString();
          const views = parseInt(
            (entry.match(/<media:statistics views="([^"]+)"/) || [])[1] || '0',
            10
          );
          const likes = parseInt(
            (entry.match(/<media:starRating count="([^"]+)"/) || [])[1] || '0',
            10
          );
          const isShort =
            vTitle.toLowerCase().includes('#shorts') ||
            vTitle.toLowerCase().includes('shorts') ||
            vTitle.toLowerCase().includes('#short');

          rawVideos.push({
            id: videoId,
            title: vTitle,
            description: '',
            publishedAt,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: isShort ? 'PT45S' : 'PT3M30S',
            durationSeconds: isShort ? 45 : 210,
            durationFormatted: isShort ? '0:45' : '3:30',
            isShort,
            views,
            likes,
            comments: Math.round(likes * 0.08),
            tags: [],
            url: `https://www.youtube.com/watch?v=${videoId}`,
            isOutlier: false,
            outlierMultiplier: 1,
          });
        }
      }
    } catch (rssErr) {
      console.error('RSS fetch error:', rssErr);
    }
  }

  if (rawVideos.length === 0) {
    throw new Error(
      `Could not retrieve public videos for channel "${title}". Please verify the URL or add a YouTube Data API v3 key in Settings.`
    );
  }

  const totalViews = rawVideos.reduce((acc, v) => acc + v.views, 0);
  const avgViews = rawVideos.length > 0 ? Math.round(totalViews / rawVideos.length) : 0;

  const channelInfo: ChannelInfo = {
    id: channelId,
    title,
    handle: `@${title.replace(/\s+/g, '')}`,
    description,
    avatarUrl: avatar,
    subscriberCount,
    totalViews: totalViews * 5, // Estimated lifetime views baseline
    totalVideosCount: rawVideos.length,
  };

  const enrichedVideos = enrichVideosWithOutliers(rawVideos, avgViews, channelInfo);

  return { channelInfo, videos: enrichedVideos };
}
