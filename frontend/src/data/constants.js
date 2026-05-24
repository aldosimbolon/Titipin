// Country configurations, exchange rates, tax rates, and other constants

export const COUNTRIES = [
  {
    id: 'CN',
    name: 'China',
    flag: '🇨🇳',
    currency: 'CNY',
    currencySymbol: '¥',
    exchangeRate: 2250,
    shippingPerKg: 85000,
    color: '#e74c3c',
    stores: ['Taobao', '1688', 'Pinduoduo', 'JD.com', 'Tmall'],
    deliveryDays: '10-18',
  },
  {
    id: 'US',
    name: 'Amerika Serikat',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    exchangeRate: 16200,
    shippingPerKg: 250000,
    color: '#3498db',
    stores: ['Amazon', 'eBay', 'Walmart', 'Best Buy', 'Target'],
    deliveryDays: '12-21',
  },
  {
    id: 'SG',
    name: 'Singapura',
    flag: '🇸🇬',
    currency: 'SGD',
    currencySymbol: 'S$',
    exchangeRate: 12100,
    shippingPerKg: 150000,
    color: '#e74c3c',
    stores: ['Shopee SG', 'Lazada SG', 'Qoo10', 'Courts'],
    deliveryDays: '7-14',
  },
  {
    id: 'GB',
    name: 'Inggris',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    exchangeRate: 20500,
    shippingPerKg: 280000,
    color: '#2c3e50',
    stores: ['Amazon UK', 'ASOS', 'Selfridges', 'John Lewis'],
    deliveryDays: '14-25',
  },
  {
    id: 'KR',
    name: 'Korea Selatan',
    flag: '🇰🇷',
    currency: 'KRW',
    currencySymbol: '₩',
    exchangeRate: 12.2,
    shippingPerKg: 180000,
    color: '#1abc9c',
    stores: ['Gmarket', 'Coupang', 'Olive Young', '11Street'],
    deliveryDays: '10-18',
  },
  {
    id: 'HK',
    name: 'Hong Kong',
    flag: '🇭🇰',
    currency: 'HKD',
    currencySymbol: 'HK$',
    exchangeRate: 2080,
    shippingPerKg: 160000,
    color: '#e67e22',
    stores: ['HKTVmall', 'Fortress', 'Sasa', 'Watsons'],
    deliveryDays: '10-16',
  },
];

export const ORDER_STATUSES = [
  { id: 'pending_quote', label: 'Menunggu Harga', icon: '📝', color: 'var(--status-pending)', badgeClass: 'badge-pending' },
  { id: 'awaiting_payment', label: 'Menunggu Pembayaran', icon: '💰', color: 'var(--status-awaiting)', badgeClass: 'badge-awaiting' },
  { id: 'purchased', label: 'Sedang Dibeli', icon: '🛒', color: 'var(--status-purchased)', badgeClass: 'badge-purchased' },
  { id: 'at_warehouse', label: 'Di Gudang LN', icon: '📦', color: 'var(--status-warehouse)', badgeClass: 'badge-warehouse' },
  { id: 'customs', label: 'Proses Customs', icon: '🛃', color: 'var(--status-customs)', badgeClass: 'badge-customs' },
  { id: 'shipped', label: 'Dikirim', icon: '🚚', color: 'var(--status-shipped)', badgeClass: 'badge-shipped' },
  { id: 'completed', label: 'Selesai', icon: '✅', color: 'var(--status-completed)', badgeClass: 'badge-completed' },
  { id: 'cancelled', label: 'Dibatalkan', icon: '❌', color: 'var(--status-cancelled)', badgeClass: 'badge-cancelled' },
];

export const TAX_RATES = {
  importDuty: 0.075,
  ppn: 0.11,
  pphWithNpwp: 0.10,
  pphWithoutNpwp: 0.20,
};

export const SERVICE_FEE_PERCENT = 0.06;

export const PAYMENT_METHODS = [
  { id: 'bca', name: 'BCA Transfer', icon: '🏦' },
  { id: 'mandiri', name: 'Mandiri Transfer', icon: '🏦' },
  { id: 'bni', name: 'BNI Transfer', icon: '🏦' },
  { id: 'gopay', name: 'GoPay', icon: '💳' },
  { id: 'ovo', name: 'OVO', icon: '💳' },
  { id: 'dana', name: 'DANA', icon: '💳' },
  { id: 'qris', name: 'QRIS', icon: '📱' },
];

export const NAV_ITEMS_CUSTOMER = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { id: 'create-order', label: 'Buat Pesanan', icon: 'add_circle', path: '/order/create' },
  { id: 'warehouse', label: 'Gudang Virtual', icon: 'warehouse', path: '/warehouse' },
  { id: 'orders', label: 'Riwayat Pesanan', icon: 'package_2', path: '/orders' },
  { id: 'profile', label: 'Profil Saya', icon: 'person', path: '/profile' },
];

export const NAV_ITEMS_ADMIN = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin' },
  { id: 'admin-orders', label: 'Kelola Pesanan', icon: 'package_2', path: '/admin/orders' },
  { id: 'admin-warehouse', label: 'Gudang Virtual', icon: 'warehouse', path: '/warehouse' },
  { id: 'admin-users', label: 'Kelola User', icon: 'group', path: '/admin/users' },
  { id: 'admin-settings', label: 'Pengaturan', icon: 'settings', path: '/admin/settings' },
];

