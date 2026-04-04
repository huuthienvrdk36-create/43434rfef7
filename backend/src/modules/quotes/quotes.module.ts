import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { QuoteSchema } from './quote.schema';
import { QuoteResponseSchema } from './quote-response.schema';
import { BookingSchema } from '../bookings/booking.schema';
import { OrganizationSchema } from '../organizations/organization.schema';
import { BranchSchema } from '../branches/branch.schema';
import { ProviderServiceSchema } from '../provider-services/provider-service.schema';
import { AuditSchema } from '../audit/audit.schema';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Quote', schema: QuoteSchema },
      { name: 'QuoteResponse', schema: QuoteResponseSchema },
      { name: 'Booking', schema: BookingSchema },
      { name: 'Organization', schema: OrganizationSchema },
      { name: 'Branch', schema: BranchSchema },
      { name: 'ProviderService', schema: ProviderServiceSchema },
      { name: 'Audit', schema: AuditSchema },
    ]),
    JwtModule.register({}),
    OrganizationsModule,
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
