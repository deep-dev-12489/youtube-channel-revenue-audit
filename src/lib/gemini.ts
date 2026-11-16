import { ChannelInfo, GeminiInsights, VideoItem } from '@/types';

/**
 * Analyzes video metadata using Google Gemini API to extract niche, sub-niche, and content angles.
 */
export async function analyzeChannelWithGemini(
  channel: ChannelInfo,
  videos: VideoItem[],
  apiKey?: string
): Promise<GeminiInsights> {
  // If no Gemini API key provided, generate heuristic analysis based on title and tag frequency
  if (!apiKey || apiKey.trim() === '') {
    return generateFallbackInsights(channel, videos);
  }

  const sortedByViews = [...videos].sort((a, b) => b.views - a.views);
  const outliers = videos.filter((v) => v.isOutlier);
  const topVideos = sortedByViews.slice(0, 10);

  // Prepare concise sample for prompt
  const videoSummaryForPrompt = topVideos.map((v, i) => ({
    rank: i + 1,
    title: v.title,
    views: v.views,
    isOutlier: v.isOutlier,
    outlierMultiplier: v.outlierMultiplier,
    durationFormatted: v.durationFormatted,
    isShort: v.isShort,
    tags: v.tags.slice(0, 5),
  }));

  const allTitles = videos.map((v) => v.title).join('\n');
  const allTags = Array.from(new Set(videos.flatMap((v) => v.tags))).slice(0, 40);

  const prompt = `You are a world-class YouTube algorithmic strategist, creator coach, and media analyst.
Analyze the following YouTube channel's past 90 days performance and content catalog:

CHANNEL INFO:
Name: ${channel.title}
Handle: ${channel.handle}
Bio: ${channel.description}
Total 90-Day Uploads: ${videos.length}
Outlier Videos (>2x avg views): ${outliers.length}

TOP PERFORMING VIDEOS (Last 90 Days):
${JSON.stringify(videoSummaryForPrompt, null, 2)}

SAMPLE OF RECENT TITLES:
${allTitles.slice(0, 3000)}

TOP RECURRENT TAGS:
${allTags.join(', ')}

Perform an in-depth strategic analysis and return a valid JSON object matching the following structure EXACTLY. Return ONLY the raw JSON object, without markdown formatting or code fences:
{
  "niche": "Primary broad industry/niche (e.g., Software Engineering & Web Development)",
  "subNiche": "Ultra-specific micro-niche (e.g., Rapid Full-Stack Frameworks & Modern AI Tools)",
  "channelSummary": "A concise 2-sentence breakdown of the channel's current positioning and competitive moat.",
  "contentPillars": [
    "Pillar 1",
    "Pillar 2",
    "Pillar 3",
    "Pillar 4"
  ],
  "topPerformingAngles": [
    {
      "angle": "Specific creative angle / framing (e.g., 'Contrarian teardowns of popular tech')",
      "whyItWorks": "Psychological trigger or algorithmic factor driving hyper-engagement",
      "avgMultiplier": "2.8x",
      "exampleVideo": "Title of an example video from this channel or best fit"
    },
    {
      "angle": "Another high-converting framing",
      "whyItWorks": "Why it converts viewers",
      "avgMultiplier": "2.1x",
      "exampleVideo": "Title"
    },
    {
      "angle": "Another framing",
      "whyItWorks": "Why it converts viewers",
      "avgMultiplier": "1.8x",
      "exampleVideo": "Title"
    }
  ],
  "audiencePersona": {
    "targetViewer": "Demographic & psychographic definition of their core audience",
    "painPoints": [
      "Pain point 1",
      "Pain point 2",
      "Pain point 3"
    ],
    "valueProposition": "The ultimate promise the channel delivers to viewers in under 15 words"
  },
  "competitorTakeaways": [
    "Takeaway 1 a competitor could replicate",
    "Takeaway 2 a competitor could replicate",
    "Takeaway 3 a competitor could replicate"
  ],
  "growthRecommendations": [
    "High-impact recommendation 1",
    "High-impact recommendation 2",
    "High-impact recommendation 3"
  ],
  "recommendedHooks": [
    "Specific title / hook idea for their next high-probability viral video",
    "Second title / hook idea",
    "Third title / hook idea"
  ]
}`;

  try {
    // Try gemini-2.5-flash / gemini-2.0-flash / gemini-1.5-flash
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let rawText = '';

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawText) break;
        }
      } catch {
        // try next model
      }
    }

    if (!rawText) {
      throw new Error('Gemini API call did not return content.');
    }

    // Strip markdown code fences if any
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed as GeminiInsights;
  } catch (error) {
    console.error('Gemini API error, falling back to heuristic analysis:', error);
    return generateFallbackInsights(channel, videos);
  }
}

/**
 * High-signal rule-based heuristic analysis when Gemini API key is absent or unreachable
 */
export function generateFallbackInsights(
  channel: ChannelInfo,
  videos: VideoItem[]
): GeminiInsights {
  // Extract word frequency from titles
  const stopWords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'was',
    'how', 'why', 'what', 'with', 'by', 'this', 'that', 'i', 'you', 'my', 'your', 'from',
    'vs', 'new', 'after', 'will', 'not', 'can', 'it', 'all', 'every', 'do', 'video', 'shorts'
  ]);

  const wordCounts: Record<string, number> = {};
  videos.forEach((v) => {
    const words = v.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);
    words.forEach((w) => {
      if (w.length > 2 && !stopWords.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });
  });

  const topKeywords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  const outliers = videos.filter((v) => v.isOutlier).sort((a, b) => b.views - a.views);
  const topOutlier = outliers[0] || videos[0];

  const primaryTopic = topKeywords[0] || 'Content';
  const secondaryTopic = topKeywords[1] || 'Media';

  return {
    niche: `${primaryTopic} & ${secondaryTopic} Production`,
    subNiche: `High-Retention ${primaryTopic} Formats & Practical Case Studies`,
    channelSummary: `${channel.title} commands authority with structured, engaging videos centered on ${primaryTopic.toLowerCase()} workflows, blending quick-paced edits with tangible takeaways.`,
    contentPillars: [
      `${primaryTopic} Deep Dives & Step-by-Step Breakdowns`,
      `Critical Teardowns & Fast-Paced News Summaries`,
      `Hands-on Experiments & Real-World Challenges`,
      `Tooling, Productivity & Workflow Optimization`,
    ],
    topPerformingAngles: [
      {
        angle: `Hyper-Specific "Before vs. After" or Challenge Benchmarking`,
        whyItWorks: `Creates instant curiosity gap and high retention through high-stakes visual payoff.`,
        avgMultiplier: topOutlier ? `${topOutlier.outlierMultiplier}x` : '2.4x',
        exampleVideo: topOutlier?.title || 'Top Performer Showcase',
      },
      {
        angle: `Contrarian Industry Hot Takes & Mythbusting`,
        whyItWorks: `Triggers active comment sections and debates, sending positive engagement signals to the YouTube algorithm.`,
        avgMultiplier: '1.9x',
        exampleVideo: outliers[1]?.title || 'Why Popular Methods Fail',
      },
      {
        angle: `Curated Speedruns ("Everything you need to know in under 10 minutes")`,
        whyItWorks: `Promises dense information without filler, maximizing audience retention curves and session watch time.`,
        avgMultiplier: '1.7x',
        exampleVideo: outliers[2]?.title || 'Complete Roadmap in 10 Minutes',
      },
    ],
    audiencePersona: {
      targetViewer: `Ambitious creators, developers, and knowledge-seekers seeking rapid, actionable mastery without corporate fluff.`,
      painPoints: [
        `Information overload and clickbait without real depth`,
        `Slow-paced tutorials with bloated intros and repetitive filler`,
        `Difficulty identifying which emerging trends actually matter`,
      ],
      valueProposition: `Zero-fluff, maximum-density insights delivered with compelling pacing and crisp visuals.`,
    },
    competitorTakeaways: [
      `Front-load high-energy value hooks within the first 5 seconds to minimize initial swipe-away rate.`,
      `Incorporate punchy on-screen chapter title cards and minimal dead air to sustain audience retention above 55%.`,
      `Pair broad, curiosity-driven titles with clean, high-contrast thumbnails featuring 3 or fewer elements.`,
    ],
    growthRecommendations: [
      `Double down on outlier video concepts by publishing a follow-up 'Part 2' or adjacent deep-dive within 14 days.`,
      `Repurpose peak-performing 60-second segments into Shorts to funnel top-of-funnel traffic back to long-form uploads.`,
      `A/B test thumbnail titles with negative or high-stakes phrasing to lift click-through rate (CTR) by 15-25%.`,
    ],
    recommendedHooks: [
      `"I Tested the Most Overhyped ${primaryTopic} Trend So You Don't Have To"`,
      `"The ${secondaryTopic} Mistake 90% of Creators Make (And How to Fix It)"`,
      `"Why Everyone Is Wrong About ${primaryTopic} in 2026"`,
    ],
  };
}
