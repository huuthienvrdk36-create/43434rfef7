import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationStatus, UserRole } from '../../shared/enums';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Organization') private readonly organizationModel: Model<any>,
    @InjectModel('Booking') private readonly bookingModel: Model<any>,
    @InjectModel('Payment') private readonly paymentModel: Model<any>,
    @InjectModel('Dispute') private readonly disputeModel: Model<any>,
    @InjectModel('Quote') private readonly quoteModel: Model<any>,
    @InjectModel('Review') private readonly reviewModel: Model<any>,
  ) {}

  /**
   * Dashboard Stats
   */
  async getDashboardStats() {
    const [users, organizations, bookings, payments, disputes, quotes, reviews] = await Promise.all([
      this.userModel.countDocuments(),
      this.organizationModel.countDocuments(),
      this.bookingModel.countDocuments(),
      this.paymentModel.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            platformFees: { $sum: '$platformFee' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.disputeModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      this.quoteModel.countDocuments(),
      this.reviewModel.countDocuments(),
    ]);

    const paymentStats = payments[0] || { total: 0, platformFees: 0, count: 0 };
    const disputeStats = disputes.reduce((acc: any, d: any) => {
      acc[d._id] = d.count;
      return acc;
    }, {});

    return {
      users: { total: users },
      organizations: { total: organizations },
      bookings: { total: bookings },
      quotes: { total: quotes },
      reviews: { total: reviews },
      payments: {
        total: paymentStats.count,
        totalAmount: paymentStats.total,
        platformFees: paymentStats.platformFees,
      },
      disputes: disputeStats,
    };
  }

  /**
   * Users
   */
  async getUsers(options?: { role?: string; limit?: number; skip?: number; search?: string }) {
    const query: any = {};
    if (options?.role) {
      query.role = options.role;
    }
    if (options?.search) {
      query.$or = [
        { email: { $regex: options.search, $options: 'i' } },
        { firstName: { $regex: options.search, $options: 'i' } },
        { lastName: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(options?.skip || 0)
        .limit(options?.limit || 50)
        .lean(),
      this.userModel.countDocuments(query),
    ]);

    return { users, total };
  }

  async blockUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { isBlocked: true } },
      { new: true },
    ).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async unblockUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { isBlocked: false } },
      { new: true },
    ).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Organizations
   */
  async getOrganizations(options?: { status?: string; limit?: number; skip?: number; search?: string }) {
    const query: any = {};
    if (options?.status) {
      query.status = options.status;
    }
    if (options?.search) {
      query.name = { $regex: options.search, $options: 'i' };
    }

    const [organizations, total] = await Promise.all([
      this.organizationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options?.skip || 0)
        .limit(options?.limit || 50)
        .lean(),
      this.organizationModel.countDocuments(query),
    ]);

    return { organizations, total };
  }

  async disableOrganization(orgId: string) {
    const org = await this.organizationModel.findByIdAndUpdate(
      orgId,
      { $set: { status: OrganizationStatus.SUSPENDED } },
      { new: true },
    );
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async enableOrganization(orgId: string) {
    const org = await this.organizationModel.findByIdAndUpdate(
      orgId,
      { $set: { status: OrganizationStatus.ACTIVE } },
      { new: true },
    );
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  /**
   * Bookings
   */
  async getBookings(options?: { status?: string; limit?: number; skip?: number }) {
    const query: any = {};
    if (options?.status) {
      query.status = options.status;
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options?.skip || 0)
        .limit(options?.limit || 50)
        .lean(),
      this.bookingModel.countDocuments(query),
    ]);

    return { bookings, total };
  }

  /**
   * Payments
   */
  async getPayments(options?: { status?: string; limit?: number; skip?: number }) {
    const query: any = {};
    if (options?.status) {
      query.status = options.status;
    }

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options?.skip || 0)
        .limit(options?.limit || 50)
        .lean(),
      this.paymentModel.countDocuments(query),
    ]);

    return { payments, total };
  }

  /**
   * Disputes
   */
  async getDisputes(options?: { status?: string; limit?: number; skip?: number }) {
    const query: any = {};
    if (options?.status) {
      query.status = options.status;
    }

    const [disputes, total] = await Promise.all([
      this.disputeModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options?.skip || 0)
        .limit(options?.limit || 50)
        .lean(),
      this.disputeModel.countDocuments(query),
    ]);

    return { disputes, total };
  }

  /**
   * Reviews
   */
  async getReviews(options?: { limit?: number; skip?: number }) {
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find()
        .sort({ createdAt: -1 })
        .skip(options?.skip || 0)
        .limit(options?.limit || 50)
        .lean(),
      this.reviewModel.countDocuments(),
    ]);

    return { reviews, total };
  }

  async hideReview(reviewId: string) {
    const review = await this.reviewModel.findByIdAndUpdate(
      reviewId,
      { $set: { status: 'hidden' } },
      { new: true },
    );
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
