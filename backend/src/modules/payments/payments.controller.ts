import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create payment for booking' })
  create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.sub, dto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm payment (mock)' })
  confirm(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirm(req.user.sub, id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my payments' })
  getMyPayments(@Req() req: any) {
    return this.paymentsService.getMyPayments(req.user.sub);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payment by booking ID' })
  getByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getByBooking(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  getById(@Param('id') id: string) {
    return this.paymentsService.getById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment (admin)' })
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }
}
