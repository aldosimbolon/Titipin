import Setting from '../models/Setting.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SETTINGS_ID = 'app_settings';

// @route GET /api/settings
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findById(SETTINGS_ID);

  // Kalau belum pernah dibuat (mis. belum sempat seeding), buat default kosong
  if (!settings) {
    settings = await Setting.create({ _id: SETTINGS_ID });
  }

  res.status(200).json({ status: 'success', data: { settings } });
});

// @route PUT /api/settings   (admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const allowedFields = [
    'storeName',
    'storeTagline',
    'whatsapp',
    'email',
    'serviceFeePercent',
    'importDuty',
    'ppn',
    'pphWithNpwp',
    'pphWithoutNpwp',
    'exchangeRates',
    'shippingRates',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const settings = await Setting.findByIdAndUpdate(SETTINGS_ID, updates, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { settings } });
});
