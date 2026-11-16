import { ChannelAnalysisResponse } from '@/types';
import { formatCompactNumber, formatCalendarDate } from './formatters';

/**
 * Generates a comprehensive, structured Markdown report from the analyzed channel data.
 */
export function generateMarkdownReport(data: ChannelAnalysisResponse): string {
  const { channel, kpis, videos, geminiInsights, fetchedAt, source } = data;
  const outliers = videos.filter((v) => v.isOutlier);

  const lines: string[] = [];

  // Header
  lines.push(`# YouTube Channel & Monetization Intelligence Audit Report`);
  lines.push(`**Channel:** ${channel.title} (${channel.handle})`);
  lines.push(`**Generated At:** ${new Date(fetchedAt).toLocaleString()}`);
  lines.push(`**Data Source:** ${source === 'api' ? 'YouTube Data API v3' : source === 'rss' ? 'Live Public YouTube Feed (Zero-Key Mode)' : 'Demo Dataset'}`);
  lines.push(`**Channel Link:** ${channel.customUrl ? `https://www.youtube.com/${channel.customUrl}` : `https://www.youtube.com/channel/${channel.id}`}`);
  lines.push('');

  // 1. Channel Overview
  lines.push(`## 1. Channel Overview & Health Metrics`);
  lines.push(`- **Subscribers:** ${formatCompactNumber(channel.subscriberCount)} (${channel.subscriberCount.toLocaleString()})`);
  lines.push(`- **Lifetime Views:** ${formatCompactNumber(channel.totalViews)} (${channel.totalViews.toLocaleString()})`);
  lines.push(`- **Total Uploads (Lifetime):** ${channel.totalVideosCount.toLocaleString()}`);
  if (channel.country) lines.push(`- **Audience Country Origin:** ${channel.country}`);
  lines.push(`- **Channel Bio:**`);
  lines.push(`  > ${channel.description ? channel.description.replace(/\n+/g, ' ') : 'No description provided.'}`);
  lines.push('');

  // 2. 90-Day Upload Cadence & Performance KPIs
  lines.push(`## 2. 90-Day Upload Cadence & Consistency Audit`);
  lines.push(`| Metric | Value | Audit Benchmark |`);
  lines.push(`| :--- | :--- | :--- |`);
  lines.push(`| **Analyzed Uploads (90d)** | ${kpis.totalVideos90d} videos | Recent active catalog window |`);
  lines.push(`| **Weekly Upload Frequency** | ${kpis.weeklyUploadFrequency} vids/week | ${kpis.weeklyUploadFrequency >= 3 ? '🔥 High velocity output' : kpis.weeklyUploadFrequency >= 1 ? '⚡ Consistent weekly rhythm' : '🐢 Low upload frequency'} |`);
  lines.push(`| **Average Upload Gap** | ${kpis.averageUploadGapDays} days | Average gap between consecutive uploads |`);
  lines.push(`| **Average Views** | ${formatCompactNumber(kpis.averageViews)} | Median Views: ${formatCompactNumber(kpis.medianViews)} |`);
  lines.push(`| **Shorts vs. Long-form** | ${kpis.longPercentage}% Long / ${kpis.shortsPercentage}% Shorts | ${kpis.longCount} Long-form, ${kpis.shortsCount} Shorts |`);
  lines.push(`| **Outlier Hit Rate (>2x Avg)** | ${kpis.outlierCount} videos (${kpis.outlierRate}%) | Outlier videos exceeding 2x channel average |`);
  lines.push(`| **Highest Video Views** | ${formatCompactNumber(kpis.highestViews)} | Peak performer in window |`);
  lines.push('');

  // 3. Monetization & Estimated Revenue Audit
  if (kpis.estimatedRevenue) {
    const rev = kpis.estimatedRevenue;
    lines.push(`## 3. Channel Monetization & Estimated AdSense Revenue Audit`);
    lines.push(`> [!NOTE]`);
    lines.push(`> Estimates are benchmarked against niche-adjusted RPM models, audience geography, and video format distribution (Long-form vs Shorts).`);
    lines.push('');
    lines.push(`| Metric | USD ($) | INR (₹) | Audit Notes |`);
    lines.push(`| :--- | :--- | :--- | :--- |`);
    lines.push(`| **Estimated 90-Day Ad Revenue** | $${rev.min90d.toLocaleString()} – $${rev.max90d.toLocaleString()} | ₹${rev.min90dInr.toLocaleString()} – ₹${rev.max90dInr.toLocaleString()} | Active 90-day window total |`);
    lines.push(`| **Projected Monthly Run-Rate** | $${rev.avgMonthlyMin.toLocaleString()} – $${rev.avgMonthlyMax.toLocaleString()}/mo | ₹${rev.avgMonthlyMinInr.toLocaleString()} – ₹${rev.avgMonthlyMaxInr.toLocaleString()}/mo | Normalized 30-day run-rate |`);
    lines.push(`| **Modeled Niche RPM Benchmark** | ~$${rev.rpmAverage} / 1,000 views | ~₹${Math.round(rev.rpmAverage * 86.5)} / 1,000 views | Niche baseline revenue per mille |`);
    lines.push('');
  }

  // 4. Gemini Strategic AI Niche & Content Dossier
  if (geminiInsights) {
    lines.push(`## 4. Gemini AI Strategic Niche & Algorithmic Moat Dossier`);
    lines.push(`- **Primary Niche:** ${geminiInsights.niche}`);
    lines.push(`- **Sub-Niche:** ${geminiInsights.subNiche}`);
    lines.push('');
    if (geminiInsights.channelSummary) {
      lines.push(`### Strategic Moat & Positioning`);
      lines.push(`${geminiInsights.channelSummary}`);
      lines.push('');
    }

    if (geminiInsights.contentPillars && geminiInsights.contentPillars.length > 0) {
      lines.push(`### Core Content Pillars`);
      geminiInsights.contentPillars.forEach((p, idx) => {
        lines.push(`${idx + 1}. **${p}**`);
      });
      lines.push('');
    }

    if (geminiInsights.topPerformingAngles && geminiInsights.topPerformingAngles.length > 0) {
      lines.push(`### Top-Performing Content Angles`);
      geminiInsights.topPerformingAngles.forEach((angle, idx) => {
        lines.push(`#### ${idx + 1}. ${angle.angle} ${angle.avgMultiplier ? `(🔥 ${angle.avgMultiplier} Avg)` : ''}`);
        lines.push(`- **Why It Works:** ${angle.whyItWorks}`);
        if (angle.exampleVideo) lines.push(`- **Example:** *"${angle.exampleVideo}"*`);
        lines.push('');
      });
    }

    if (geminiInsights.audiencePersona) {
      lines.push(`### Target Audience Persona`);
      lines.push(`- **Viewer Profile:** ${geminiInsights.audiencePersona.targetViewer}`);
      lines.push(`- **Core Value Proposition:** *"${geminiInsights.audiencePersona.valueProposition}"*`);
      if (geminiInsights.audiencePersona.painPoints?.length > 0) {
        lines.push(`- **Key Viewer Pain Points:**`);
        geminiInsights.audiencePersona.painPoints.forEach((pain) => {
          lines.push(`  - ${pain}`);
        });
      }
      lines.push('');
    }

    if (geminiInsights.competitorTakeaways && geminiInsights.competitorTakeaways.length > 0) {
      lines.push(`### Actionable Competitor Takeaways`);
      geminiInsights.competitorTakeaways.forEach((t) => lines.push(`- [x] ${t}`));
      lines.push('');
    }

    if (geminiInsights.growthRecommendations && geminiInsights.growthRecommendations.length > 0) {
      lines.push(`### Growth Recommendations`);
      geminiInsights.growthRecommendations.forEach((r) => lines.push(`- 🚀 ${r}`));
      lines.push('');
    }

    if (geminiInsights.recommendedHooks && geminiInsights.recommendedHooks.length > 0) {
      lines.push(`### High-Converting Next Video Hooks`);
      geminiInsights.recommendedHooks.forEach((hook, i) => lines.push(`${i + 1}. *"${hook}"*`));
      lines.push('');
    }
  }

  // 5. Viral Outlier Videos
  if (outliers.length > 0) {
    lines.push(`## 5. Viral Outlier Videos (>2x Channel Average Views)`);
    lines.push(`| Title | Views | Multiplier | Duration | Link |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
    outliers.forEach((v) => {
      const cleanTitle = v.title.replace(/\|/g, '-');
      lines.push(`| **${cleanTitle}** | ${formatCompactNumber(v.views)} (${v.views.toLocaleString()}) | 🔥 ${v.outlierMultiplier}x Avg | ${v.durationFormatted} | [Watch on YouTube](${v.url}) |`);
    });
    lines.push('');
  }

  // 6. Full Video Catalog
  lines.push(`## 6. Complete Video Performance Catalog (${videos.length} Videos)`);
  lines.push(`| # | Title | Published | Format | Duration | Views | Likes | Link |`);
  lines.push(`| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
  videos.forEach((v, idx) => {
    const cleanTitle = v.title.replace(/\|/g, '-');
    const format = v.isShort ? 'Short' : 'Long-form';
    lines.push(`| ${idx + 1} | ${cleanTitle} | ${formatCalendarDate(v.publishedAt)} | ${format} | ${v.durationFormatted} | ${formatCompactNumber(v.views)} | ${formatCompactNumber(v.likes)} | [Link](${v.url}) |`);
  });
  lines.push('');

  lines.push(`---`);
  lines.push(`*Report generated automatically by TubePulse Pro - YouTube Channel & Revenue Audit Studio*`);

  return lines.join('\n');
}

/**
 * Initiates an instant download of the Markdown file in the browser.
 */
export function downloadMarkdownReport(data: ChannelAnalysisResponse): void {
  const content = generateMarkdownReport(data);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanTitle = (data.channel.title || 'Channel').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanTitle}_YouTube_Analytics_Audit_Report.md`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
