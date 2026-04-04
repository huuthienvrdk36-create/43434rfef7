import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentStatus } from './payment.schema';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
import { BookingStatus } from '../../shared/enums';

@Injectable()
export class PaymentsService {
  // Platform fee percentage (can be configured)
  private readonly PLATFORM_FEE_PERCENT = 15;

  constructor(
    @InjectModel('Payment') private readonly paymentModel: Model<any>,
    @InjectModel('Booking') private readonly bookingModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<any>,
  ) {}

  /**
   * Create a payment for booking
   */
  async create(userId: string, dto: CreatePaymentDto) {
    // Get booking
    const booking: any = await this.bookingModel.findById(dto.bookingId).lean();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user owns this booking
    if (String(booking.userId) !== userId) {
      throw new BadRequestException('Not authorized');
    }

    // Check booking status - must be confirmed
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be confirmed before payment');
    }

    // Check if payment already exists
    const existingPayment = await this.paymentModel.findOne({ bookingId: dto.bookingId });
    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.PAID) {
        throw new ConflictException('Payment already completed');
      }
      // Return existing pending payment
      return existingPayment;
    }

    // Get user for snapshot
    const user: any = await this.userModel.findById(userId).lean();

    // Calculate amounts
    const amount = booking.snapshot?.price || 0;
    const platformFee = Math.round(amount * (this.PLATFORM_FEE_PERCENT / 100));
    const providerAmount = amount - platformFee;

    // Create payment
    const payment = await this.paymentModel.create({
      bookingId: new Types.ObjectId(dto.bookingId),
      userId: new Types.ObjectId(userId),
      organizationId: booking.organizationId,
      amount,
      currency: 'RUB',
      platformFee,
      providerAmount,
      platformFeePercent: this.PLATFORM_FEE_PERCENT,
      status: PaymentStatus.PENDING,
      paymentMethod: dto.paymentMethod || 'card',
      snapshot: {
        serviceName: booking.snapshot?.serviceName || '',
        orgName: booking.snapshot?.orgName || '',
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      },
    });

    return payment;
  }

  /**
   * Confirm payment (mock - in real app would integrate with Stripe)
   */
  async confirm(userId: string, paymentId: string, dto: ConfirmPaymentDto) {
    const payment: any = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (String(payment.userId) !== userId) {
      throw new BadRequestException('Not authorized');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new ConflictException('Payment already completed');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment was refunded');
    }

    // Mock payment confirmation
    // In real app, this would verify with Stripe/payment provider
    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.transactionId = dto.transactionId || `mock_${Date.now()}`;
    await payment.save();

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getById(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId).lean();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  /**
   * Get payment by booking ID
   */
  async getByBooking(bookingId: string) {
    return this.paymentModel.findOne({ bookingId: new Types.ObjectId(bookingId) }).lean();
  }

  /**
   * Get user's payments
   */
  async getMyPayments(userId: string) {
    return this.paymentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Refund payment (admin)
   */
  async refund(paymentId: string) {
    const payment: any = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Can only refund paid payments');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    await payment.save();

    return payment;
  }

  /**
   * Get all payments (admin)
   */
  async getAllPayments(options?: { status?: string; limit?: number; skip?: number }) {
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

    // Calculate totals
    const stats = await this.paymentModel.aggregate([
      { $match: { status: PaymentStatus.PAID } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPlatformFee: { $sum: '$platformFee' },
          totalProviderAmount: { $sum: '$providerAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      payments,
      total,
      stats: stats[0] || { totalAmount: 0, totalPlatformFee: 0, totalProviderAmount: 0, count: 0 },
    };
  }
}
