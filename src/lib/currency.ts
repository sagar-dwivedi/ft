import type { UserPreferences } from '@/db/schema';

// Currency configuration
const CURRENCY_CONFIG = {
  USD: { symbol: '$', code: 'USD', decimals: 2 },
  EUR: { symbol: '€', code: 'EUR', decimals: 2 },
  GBP: { symbol: '£', code: 'GBP', decimals: 2 },
  JPY: { symbol: '¥', code: 'JPY', decimals: 0 },
  CAD: { symbol: 'C$', code: 'CAD', decimals: 2 },
  AUD: { symbol: 'A$', code: 'AUD', decimals: 2 },
  CHF: { symbol: 'CHF', code: 'CHF', decimals: 2 },
  CNY: { symbol: '¥', code: 'CNY', decimals: 2 },
  INR: { symbol: '₹', code: 'INR', decimals: 2 },
  BRL: { symbol: 'R$', code: 'BRL', decimals: 2 },
  MXN: { symbol: '$', code: 'MXN', decimals: 2 },
  KRW: { symbol: '₩', code: 'KRW', decimals: 0 },
  RUB: { symbol: '₽', code: 'RUB', decimals: 2 },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;

interface FormatCurrencyOptions {
  currency?: CurrencyCode;
  locale?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
  compact?: boolean;
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero';
}

/**
 * Format currency with proper symbol, locale, and styling
 */
export function formatCurrency(
  amount: number | string,
  options: FormatCurrencyOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showSymbol = true,
    showCode = false,
    decimals,
    compact = false,
    signDisplay = 'auto',
  } = options;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Invalid amount';
  }

  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const decimalPlaces = decimals ?? config.decimals;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      signDisplay,
      notation: compact ? 'compact' : 'standard',
    });

    let formatted = formatter.format(numAmount);

    // Custom formatting adjustments
    if (!showSymbol) {
      formatted = formatted.replace(config.symbol, '').trim();
    }

    if (showCode && !formatted.includes(currency)) {
      formatted = `${formatted} ${currency}`;
    }

    return formatted;
  } catch {
    // Fallback for unsupported locales/currencies
    const symbol = showSymbol ? config.symbol : '';
    const code = showCode ? ` ${currency}` : '';
    const value = numAmount.toFixed(decimalPlaces);
    const sign = numAmount < 0 ? '-' : '';

    return `${sign}${symbol}${Math.abs(parseFloat(value)).toLocaleString()}${code}`;
  }
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(value: string, options: { currency?: CurrencyCode } = {}): number {
  const { currency = 'USD' } = options;

  // Remove currency symbols and spaces
  const cleanValue = value
    .replace(/[,$\s]/g, '')
    .replace(CURRENCY_CONFIG[currency]?.symbol || '', '')
    .trim();

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format for display in input fields (without symbol)
 */
export function formatCurrencyInput(amount: number | string, decimals: number = 2): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return '0';

  return numAmount.toFixed(decimals);
}

/**
 * Format for compact display (K, M, B)
 */
export function formatCurrencyCompact(amount: number, currency: CurrencyCode = 'USD'): string {
  const absAmount = Math.abs(amount);

  if (absAmount < 1000) {
    return formatCurrency(amount, { currency, compact: true });
  }

  const tiers = [
    { value: 1e12, symbol: 'T' },
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' },
  ];

  for (const tier of tiers) {
    if (absAmount >= tier.value) {
      const formatted = (amount / tier.value).toFixed(1);
      const clean = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
      return `${CURRENCY_CONFIG[currency].symbol}${clean}${tier.symbol}`;
    }
  }

  return formatCurrency(amount, { currency });
}

/**
 * Format percentage change with colors
 */
export function formatPercentChange(
  current: number,
  previous: number,
  options: { showColors?: boolean } = {}
): { value: string; color: string } {
  const { showColors = true } = options;

  if (previous === 0) {
    return { value: '0%', color: 'text-gray-600' };
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  const formatted = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;

  if (!showColors) {
    return { value: formatted, color: '' };
  }

  const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';

  return { value: formatted, color };
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode = 'USD'): string {
  return CURRENCY_CONFIG[currency]?.symbol || '$';
}

/**
 * Format for different locales
 */
export function formatCurrencyByLocale(
  amount: number,
  locale: string,
  currency: CurrencyCode = 'USD'
): string {
  return formatCurrency(amount, { locale, currency });
}

/**
 * Zero-pad currency values for alignment
 */
export function formatCurrencyAligned(
  amount: number,
  currency: CurrencyCode = 'USD',
  width: number = 10
): string {
  const formatted = formatCurrency(amount, { currency });
  return formatted.padStart(width);
}

/**
 * Currency conversion helper (rates would need to be fetched from API)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  return amount * rate;
}

/**
 * Format currency with custom styling for React components
 */
export interface CurrencyDisplayProps {
  amount: number;
  currency?: CurrencyCode;
  showSign?: boolean;
  className?: string;
  positiveClassName?: string;
  negativeClassName?: string;
  zeroClassName?: string;
}

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  showSign = false,
  positiveClassName = 'text-green-600',
  negativeClassName = 'text-red-600',
  zeroClassName = 'text-gray-600',
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount, {
    currency,
    signDisplay: showSign ? 'always' : 'auto',
  });

  let colorClass = zeroClassName;
  if (amount > 0) colorClass = positiveClassName;
  if (amount < 0) colorClass = negativeClassName;

  return `${formatted}`;
}

// React hook for user-specific formatting
export function useCurrencyFormatter(preferences?: UserPreferences) {
  const locale = preferences?.dateFormat?.includes('/') ? 'en-US' : 'en-GB';
  const currency = (preferences?.currency as CurrencyCode) || 'USD';

  return {
    format: (amount: number, options?: Omit<FormatCurrencyOptions, 'currency' | 'locale'>) =>
      formatCurrency(amount, { currency, locale, ...options }),
    parse: (value: string) => parseCurrency(value, { currency }),
    symbol: getCurrencySymbol(currency),
    currency,
    locale,
  };
}
