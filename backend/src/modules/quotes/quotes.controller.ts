import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { RespondQuoteDto } from './dto/respond-quote.dto';

@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Roles(UserRole.CUSTOMER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create(req.user.sub, dto);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('my')
  myQuotes(@Req() req: any) {
    return this.quotesService.myQuotes(req.user.sub);
  }

  @Roles(UserRole.PROVIDER_OWNER, UserRole.PROVIDER_MANAGER, UserRole.ADMIN)
  @Get('incoming')
  incomingQuotes() {
    return this.quotesService.incomingQuotes();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.quotesService.getById(id);
  }

  @Roles(UserRole.PROVIDER_OWNER, UserRole.PROVIDER_MANAGER, UserRole.ADMIN)
  @Post(':id/respond')
  respond(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: RespondQuoteDto,
  ) {
    return this.quotesService.respond(id, req.user.sub, req.user.role, dto);
  }

  @Roles(UserRole.CUSTOMER)
  @Post(':id/accept/:responseId')
  accept(
    @Param('id') id: string,
    @Param('responseId') responseId: string,
    @Req() req: any,
  ) {
    return this.quotesService.accept(id, responseId, req.user.sub);
  }

  @Roles(UserRole.CUSTOMER)
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.quotesService.cancel(id, req.user.sub);
  }
}
