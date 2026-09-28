import mongoose from 'mongoose';

const { Schema } = mongoose;

// Titipin cuma butuh SATU dokumen settings untuk seluruh aplikasi
// (pengaturan toko, kurs, tarif pajak, ongkir per negara).
const settingSchema = new Schema(
  {
    _id: { type: String, default: 'app_settings' },
    storeName: { type: String, default: 'TitipIn' },
    storeTagline: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    serviceFeePercent: { type: Number, default: 6 },
    importDuty: { type: Number, default: 7.5 },
    ppn: { type: Number, default: 11 },
    pphWithNpwp: { type: Number, default: 10 },
    pphWithoutNpwp: { type: Number, default: 20 },
    // Kurs mata uang asing ke Rupiah, contoh: { USD: 16200, CNY: 2250 }
    exchangeRates: { type: Map, of: Number, default: {} },
    // Ongkir internasional per kg per negara, contoh: { US: 250000, CN: 85000 }
    shippingRates: { type: Map, of: Number, default: {} },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    _id: false,
    toJSON: {
      flattenMaps: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },

  }
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
