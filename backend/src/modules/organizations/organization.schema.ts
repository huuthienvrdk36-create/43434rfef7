import { Schema } from 'mongoose';
import { OrganizationStatus } from '../../shared/enums';

export const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, unique: true, sparse: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(OrganizationStatus),
      default: OrganizationStatus.DRAFT,
      index: true,
    },
    description: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    taxId: { type: String, default: '' },
    legalName: { type: String, default: '' },
    specializations: [{ type: String }],
    // Derived — recalculated separately
    ratingAvg: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
    completedBookingsCount: { type: Number, default: 0 },
    // Ranking System
    rankScore: { type: Number, default: 0, index: true },
    avgResponseTimeMinutes: { type: Number, default: null }, // average response time in minutes
    totalResponsesCount: { type: Number, default: 0 },
    // Boost / Monetization
    isBoosted: { type: Boolean, default: false, index: true },
    boostUntil: { type: Date, default: null },
    boostMultiplier: { type: Number, default: 1 }, // rankScore multiplier when boosted
    // Stats
    quotesReceivedCount: { type: Number, default: 0 },
    quotesRespondedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Compound index for ranking queries
OrganizationSchema.index({ status: 1, rankScore: -1 });
OrganizationSchema.index({ isBoosted: 1, boostUntil: 1 });
