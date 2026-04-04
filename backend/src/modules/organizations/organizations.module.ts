import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationSchema } from './organization.schema';
import { OrganizationMembershipSchema } from './organization-membership.schema';
import { AuditSchema } from '../audit/audit.schema';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { RankingService } from './ranking.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Organization', schema: OrganizationSchema },
      { name: 'OrganizationMembership', schema: OrganizationMembershipSchema },
      { name: 'Audit', schema: AuditSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, RankingService],
  exports: [OrganizationsService, RankingService],
})
export class OrganizationsModule {}
