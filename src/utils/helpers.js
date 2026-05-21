// Utility functions for TitipIn
import { COUNTRIES, TAX_RATES, SERVICE_FEE_PERCENT } from '../data/constants';

// Format currency to Indonesian Rupiah
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

// Format date to Indonesian locale
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Format date with time
export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format relative time
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDate(dateStr);
}

// Generate order ID
export function generateOrderId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TI-${dateStr}-${rand}`;
}

// Generate generic ID
export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Get country by ID
export function getCountry(countryId) {
  return COUNTRIES.find(c => c.id === countryId);
}

// Convert foreign currency to IDR
export function toIDR(amount, currency) {
  const country = COUNTRIES.find(c => c.currency === currency);
  if (!country) return amount;
  return Math.round(amount * country.exchangeRate);
}

// Calculate cost estimate
export function calculateEstimate(countryId, priceOriginal, currency, weight, hasNpwp = false) {
  const country = getCountry(countryId);
  if (!country) return null;

  const itemTotalIDR = toIDR(priceOriginal, currency);
  const serviceFee = Math.round(itemTotalIDR * SERVICE_FEE_PERCENT);
  const shippingIntl = Math.round(weight * country.shippingPerKg);
  const importDuty = Math.round(itemTotalIDR * TAX_RATES.importDuty);
  const ppn = Math.round(itemTotalIDR * TAX_RATES.ppn);
  const pphRate = hasNpwp ? TAX_RATES.pphWithNpwp : TAX_RATES.pphWithoutNpwp;
  const pph = Math.round(itemTotalIDR * pphRate);
  const total = itemTotalIDR + serviceFee + shippingIntl + importDuty + ppn + pph;

  return {
    itemTotal: itemTotalIDR,
    serviceFee,
    shippingIntl,
    importDuty,
    ppn,
    pph,
    pphRate: pphRate * 100,
    total,
  };
}

// Validate email
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone (Indonesian format)
export function isValidPhone(phone) {
  return /^0[0-9]{9,12}$/.test(phone);
}

// Truncate text
export function truncate(str, maxLen = 40) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '...';
}

// Debounce function
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Parse URL to get store name
export function getStoreFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const parts = hostname.split('.');
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return 'Unknown';
  }
}
