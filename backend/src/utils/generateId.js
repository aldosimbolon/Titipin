// Generator id sederhana, dipakai supaya format id konsisten dengan
// data seed yang sudah ada (mis. 'user001', 'addr001', 'TI-20260501-A1B2').

const randomAlnum = (length) =>
  Math.random().toString(36).substring(2, 2 + length).toUpperCase();

export const generateUserId = () => `user_${Date.now().toString(36)}${randomAlnum(4).toLowerCase()}`;

export const generateAddressId = () => `addr_${Date.now().toString(36)}${randomAlnum(4).toLowerCase()}`;

export const generateItemId = () => `item_${Date.now().toString(36)}${randomAlnum(4).toLowerCase()}`;

export const generateNotificationTitleId = () => `notif_${Date.now().toString(36)}${randomAlnum(4).toLowerCase()}`;

// Format: TI-YYYYMMDD-XXXX (4 karakter acak huruf besar/angka)
export const generateOrderId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `TI-${y}${m}${d}-${randomAlnum(4)}`;
};
