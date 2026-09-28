import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { addressSchema } from './subschemas.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // Pakai id custom (mis. 'user001', 'admin001') sebagai _id supaya cocok
    // dengan referensi userId yang sudah dipakai di data Order/Notification.
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // NOTE: di seed.js password masih plain text untuk kebutuhan dummy data.
    // Kalau backend auth beneran dibuat nanti, ganti jadi hash (bcrypt) sebelum disimpan.
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    avatar: { type: String, default: null },
    npwp: { type: String, default: '' },
    addresses: { type: [addressSchema], default: [] },
    isActive: { type: Boolean, default: true },
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

// Hash password otomatis setiap kali field password baru dibuat/diubah.
// Ini juga jalan waktu seeding, karena seed.js pakai User.create() (bukan insertMany)
// supaya hook ini ikut ke-trigger.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
