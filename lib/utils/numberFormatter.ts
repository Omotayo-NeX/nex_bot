/**
 * Format large numbers with K, M, B notation for better display
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.5K", "2.3M")
 */
export function formatLargeNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000) {
    return sign + (absNum / 1000000000).toFixed(decimals) + 'B';
  }

  if (absNum >= 1000000) {
    return sign + (absNum / 1000000).toFixed(decimals) + 'M';
  }

  if (absNum >= 1000) {
    return sign + (absNum / 1000).toFixed(decimals) + 'K';
  }

  return sign + absNum.toString();
}

/**
 * Format currency with smart sizing
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'NGN')
 * @param compact - Whether to use compact notation (default: false)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'NGN',
  compact: boolean = false
): string {
  const symbols: Record<string, string> = {
    'NGN': '₦',
    'USD': '$',
    'GBP': '£',
    'EUR': '€'
  };

  const symbol = symbols[currency] || currency;

  if (compact && Math.abs(amount) >= 10000) {
    return symbol + formatLargeNumber(amount);
  }

  return symbol + amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format number with responsive sizing based on screen width
 * @param num - The number to format
 * @param isMobile - Whether displaying on mobile
 * @returns Formatted number string
 */
export function formatResponsiveNumber(num: number, isMobile: boolean = false): string {
  if (isMobile && Math.abs(num) >= 100000) {
    return formatLargeNumber(num);
  }

  if (Math.abs(num) >= 1000000) {
    return formatLargeNumber(num);
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
