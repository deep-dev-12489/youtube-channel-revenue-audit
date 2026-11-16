/**
 * Formats large numbers into clean human-readable strings (e.g. 1.2M, 450K)
 */
export function formatCompactNumber(num: number): string {
  if (isNaN(num)) return '0';
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

/**
 * Formats currency in USD ($) or Indian Rupees (₹) with Lakhs & Crores
 */
export function formatCurrency(amount: number, currency: 'USD' | 'INR' = 'USD'): string {
  if (isNaN(amount) || amount === 0) {
    return currency === 'USD' ? '$0' : '₹0';
  }

  if (currency === 'INR') {
    if (amount >= 10_000_000) {
      return `₹${(amount / 10_000_000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (amount >= 100_000) {
      return `₹${(amount / 100_000).toFixed(1).replace(/\.0$/, '')} L`;
    }
    if (amount >= 1_000) {
      return `₹${(amount / 1_000).toFixed(1).replace(/\.0$/, '')} K`;
    }
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }

  // USD
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}
export function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats date into standard month/day/year
 */
export function formatCalendarDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
