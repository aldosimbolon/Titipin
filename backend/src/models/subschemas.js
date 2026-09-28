import mongoose from 'mongoose';

const { Schema } = mongoose;

// Dipakai di User.addresses[] dan Order.shippingAddress (snapshot alamat saat order dibuat)
export const addressSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: '' }, // contoh: "Rumah", "Kantor", "Kost"
    recipient: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

// Satu barang titipan di dalam sebuah order
export const orderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, default: '' },
    variant: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceOriginal: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true }, // USD, CNY, SGD, GBP, KRW, HKD
    weight: { type: Number, default: 0 }, // kg
    notes: { type: String, default: '' },
    imageUrl: { type: String, default: null },
  },
  { _id: false }
);

// Rincian biaya (dipakai untuk estimatedCost dan finalCost)
export const costBreakdownSchema = new Schema(
  {
    itemTotal: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    shippingIntl: { type: Number, required: true },
    shippingDomestic: { type: Number, default: 0 },
    importDuty: { type: Number, required: true },
    ppn: { type: Number, required: true },
    pph: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

// Status pembayaran tahap 1 (di muka) dan tahap 2 (ongkir domestik saat barang tiba)
export const paymentStageSchema = new Schema(
  {
    amount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paidAt: { type: Date, default: null },
    method: { type: String, default: null }, // bca, mandiri, gopay, ovo, dana, qris, dll
  },
  { _id: false }
);

export const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    date: { type: Date, required: true },
    note: { type: String, default: '' },
  },
  { _id: false }
);

export const orderNoteSchema = new Schema(
  {
    from: { type: String, enum: ['user', 'admin'], required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);
