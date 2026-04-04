import { Schema } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export const PaymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    // Amounts
    amount: { type: Number, required: true }, // Total amount
    currency: { type: String, default: 'RUB' },
    platformFee: { type: Number, required: true }, // Platform commission
    providerAmount: { type: Number, required: true }, // Amount to provider
    platformFeePercent: { type: Number, default: 15 }, // Commission percentage
    // Status
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    // Payment details
    paymentMethod: { type: String, default: 'card' },
    transactionId: { type: String, default: null }, // External payment system ID
    // Timestamps
    paidAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    // Snapshot for history
    snapshot: {
      serviceName: { type: String, default: '' },
      orgName: { type: String, default: '' },
      userName: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

PaymentSchema.index({ status: 1, createdAt: -1 });
