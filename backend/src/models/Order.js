import mongoose from 'mongoose';
import {
  addressSchema,
  orderItemSchema,
  costBreakdownSchema,
  paymentStageSchema,
  statusHistorySchema,
  orderNoteSchema,
} from './subschemas.js';

const { Schema } = mongoose;

export const ORDER_STATUSES = [
  'pending_quote',
  'awaiting_payment',
  'purchased',
  'at_warehouse',
  'customs',
  'shipped',
  'completed',
  'cancelled',
];

const orderSchema = new Schema(
  {
    // Pakai id custom (mis. 'TI-20260501-A1B2', 'TTP-US-89241') sebagai _id,
    // sama seperti format id order yang sudah dipakai di frontend.
    _id: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true },
    country: { type: String, required: true }, // CN, US, SG, GB, KR, HK
    warehouseLocation: { type: String, default: null },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending_quote' },
    items: { type: [orderItemSchema], default: [] },
    shippingAddress: { type: addressSchema, required: true },
    npwp: { type: String, default: '' },
    estimatedCost: { type: costBreakdownSchema, default: null },
    finalCost: { type: costBreakdownSchema, default: null },
    paymentStage1: { type: paymentStageSchema, default: null },
    paymentStage2: { type: paymentStageSchema, default: null },
    statusHistory: { type: [statusHistorySchema], default: [] },
    notes: { type: [orderNoteSchema], default: [] },
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

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
