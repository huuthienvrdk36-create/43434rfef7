import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { RespondQuoteDto } from './dto/respond-quote.dto';
import { QuoteStatus, UserRole, BookingStatus } from '../../shared/enums';
import { EventBus, PlatformEvent } from '../../shared/events';
import { RankingService } from '../organizations/ranking.service';

@Injectable()
export class QuotesService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel('Quote') private readonly quoteModel: Model<any>,
    @InjectModel('QuoteResponse') private readonly quoteResponseModel: Model<any>,
    @InjectModel('Booking') private readonly bookingModel: Model<any>,
    @InjectModel('ProviderService') private readonly providerServiceModel: Model<any>,
    @InjectModel('Organization') private readonly organizationModel: Model<any>,
    @InjectModel('Branch') private readonly branchModel: Model<any>,
    @InjectModel('Audit') private readonly auditModel: Model<any>,
    private readonly eventBus: EventBus,
    private readonly rankingService: RankingService,
  ) {}

  async create(userId: string, dto: CreateQuoteDto) {
    const quote = await this.quoteModel.create({
      userId,
      vehicleId: dto.vehicleId || null,
      requestedServiceId: dto.requestedServiceId || null,
      description: dto.description,
      city: dto.city,
      status: QuoteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.auditModel.create({
      entity: 'Quote',
      entityId: String(quote._id),
      action: 'QUOTE_CREATED',
      actorId: userId,
      prev: null,
      next: { status: quote.status },
    });

    // Emit event for notifications
    await this.eventBus.emit(PlatformEvent.QUOTE_CREATED, {
      quoteId: String(quote._id),
      customerId: userId,
      cityId: dto.city,
      description: dto.description,
    });

    return quote;
  }

  async myQuotes(userId: string) {
    return this.quoteModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getById(quoteId: string) {
    const quote = await this.quoteModel.findById(quoteId).lean();
    if (!quote) throw new NotFoundException('Quote not found');

    const responses = await this.quoteResponseModel
      .find({ quoteId })
      .lean();

    return { ...quote, responses };
  }

  async incomingQuotes() {
    return this.quoteModel
      .find({
        status: {
          $in: [QuoteStatus.PENDING, QuoteStatus.IN_REVIEW, QuoteStatus.RESPONDED],
        },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async respond(
    quoteId: string,
    actorId: string,
    actorRole: UserRole,
    dto: RespondQuoteDto,
  ) {
    if (
      actorRole !== UserRole.PROVIDER_OWNER &&
      actorRole !== UserRole.PROVIDER_MANAGER &&
      actorRole !== UserRole.ADMIN
    ) {
      throw new BadRequestException('Only provider can respond');
    }

    const quote = await this.quoteModel.findById(quoteId);
    if (!quote) throw new NotFoundException('Quote not found');

    if (
      quote.status !== QuoteStatus.PENDING &&
      quote.status !== QuoteStatus.IN_REVIEW &&
      quote.status !== QuoteStatus.RESPONDED
    ) {
      throw new BadRequestException('Quote is not accepting responses');
    }

    const branch = await this.branchModel.findById(dto.branchId);
    if (!branch) throw new NotFoundException('Branch not found');

    const providerService = await this.providerServiceModel.findById(dto.providerServiceId);
    if (!providerService) throw new NotFoundException('Provider service not found');

    // Get organization from branch
    const organization = await this.organizationModel.findById(branch.organizationId);
    if (!organization) throw new NotFoundException('Organization not found');

    await this.quoteResponseModel.create({
      quoteId,
      providerId: organization._id,
      branchId: dto.branchId,
      providerServiceId: dto.providerServiceId,
      price: dto.price,
      message: dto.message || '',
    });

    const prev = quote.status;

    if (quote.status === QuoteStatus.PENDING) {
      quote.status = QuoteStatus.IN_REVIEW;
    }
    if (quote.status === QuoteStatus.IN_REVIEW) {
      quote.status = QuoteStatus.RESPONDED;
    }

    quote.responsesCount = (quote.responsesCount || 0) + 1;
    await quote.save();

    await this.auditModel.create({
      entity: 'Quote',
      entityId: String(quote._id),
      action: 'QUOTE_RESPONDED',
      actorId,
      prev: { status: prev },
      next: { status: quote.status },
    });

    // Emit event for notifications
    await this.eventBus.emit(PlatformEvent.QUOTE_RESPONDED, {
      quoteId: String(quote._id),
      customerId: String(quote.userId),
      providerId: String(organization._id),
      responseId: String(quote._id),
      price: dto.price,
    });

    // Update ranking: calculate response time and update score
    const quoteCreatedAt = new Date(quote.createdAt).getTime();
    const responseTimeMinutes = (Date.now() - quoteCreatedAt) / 60000;
    await this.rankingService.updateResponseTime(String(organization._id), responseTimeMinutes);

    return { success: true, quoteStatus: quote.status };
  }

  async accept(quoteId: string, responseId: string, userId: string) {
    const session = await this.connection.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const quote = await this.quoteModel.findById(quoteId).session(session);
        if (!quote) throw new NotFoundException('Quote not found');

        if (String(quote.userId) !== userId) {
          throw new BadRequestException('Forbidden');
        }

        if (quote.status !== QuoteStatus.RESPONDED) {
          throw new BadRequestException('Quote is not ready for accept');
        }

        const response = await this.quoteResponseModel
          .findById(responseId)
          .session(session);

        if (!response || String(response.quoteId) !== quoteId) {
          throw new BadRequestException('Response not found for this quote');
        }

        const provider = await this.organizationModel
          .findById(response.providerId)
          .session(session);

        const branch = await this.branchModel
          .findById(response.branchId)
          .session(session);

        const providerService = await this.providerServiceModel
          .findById(response.providerServiceId)
          .populate('serviceId')
          .session(session);

        // Get user for snapshot
        const user = await this.connection.model('User').findById(userId).session(session);

        const prev = quote.status;
        quote.status = QuoteStatus.ACCEPTED;
        await quote.save({ session });

        // Mark all responses as not selected, then mark the chosen one
        await this.quoteResponseModel.updateMany(
          { quoteId },
          { $set: { isSelected: false } },
          { session },
        );

        response.isSelected = true;
        await response.save({ session });

        const booking = await this.bookingModel.create(
          [
            {
              userId,
              organizationId: provider?._id,
              branchId: branch?._id,
              providerServiceId: providerService?._id,
              quoteId: quote._id,
              quoteResponseId: response._id,
              status: BookingStatus.PENDING,
              snapshot: {
                orgName: provider?.name || '',
                branchName: branch?.name || branch?.address || '',
                branchAddress: branch?.address || '',
                serviceName: providerService?.serviceId?.name || '',
                price: response.price,
                customerName: user ? `${user.firstName} ${user.lastName}` : '',
                vehicleBrand: '',
                vehicleModel: '',
              },
            },
          ],
          { session },
        );

        await this.auditModel.create(
          [
            {
              entity: 'Quote',
              entityId: String(quote._id),
              action: 'QUOTE_ACCEPTED',
              actorId: userId,
              prev: { status: prev },
              next: { status: quote.status },
            },
            {
              entity: 'Booking',
              entityId: String(booking[0]._id),
              action: 'BOOKING_CREATED_FROM_QUOTE',
              actorId: userId,
              prev: null,
              next: { status: booking[0].status },
            },
          ],
          { session, ordered: true },
        );

        return booking[0];
      });

      return result;
    } finally {
      session.endSession();
    }
  }

  async cancel(quoteId: string, userId: string) {
    const quote = await this.quoteModel.findById(quoteId);
    if (!quote) throw new NotFoundException('Quote not found');

    if (String(quote.userId) !== userId) {
      throw new BadRequestException('Forbidden');
    }

    const cancellable = [QuoteStatus.PENDING, QuoteStatus.IN_REVIEW, QuoteStatus.RESPONDED];
    if (!cancellable.includes(quote.status as QuoteStatus)) {
      throw new BadRequestException('Quote cannot be cancelled in current status');
    }

    const prev = quote.status;
    quote.status = QuoteStatus.CANCELLED;
    await quote.save();

    await this.auditModel.create({
      entity: 'Quote',
      entityId: String(quote._id),
      action: 'QUOTE_CANCELLED',
      actorId: userId,
      prev: { status: prev },
      next: { status: quote.status },
    });

    return quote;
  }
}
