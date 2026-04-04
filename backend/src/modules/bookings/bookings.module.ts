import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { BookingSchema } from './booking.schema';
import { AuditSchema } from '../audit/audit.schema';
import { OrganizationSchema } from '../organizations/organization.schema';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Booking', schema: BookingSchema },
      { name: 'Audit', schema: AuditSchema },
      { name: 'Organization', schema: OrganizationSchema },
    ]),
    JwtModule.register({}),
    OrganizationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
