import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DrugArrivalService } from './drug-arrival.service';
import { CreateDrugArrivalDto } from './dto/create-drug-arrival.dto';
import { UpdateDrugArrivalDto } from './dto/update-drug-arrival.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('drug-arrivals')
export class DrugArrivalController {
  constructor(private readonly drugArrivalService: DrugArrivalService) {}

  @Post()
  create(@Body() createDrugArrivalDto: CreateDrugArrivalDto) {
    return this.drugArrivalService.create(createDrugArrivalDto);
  }

  @Get()
  findAll() {
    return this.drugArrivalService.findAll();
  }

  @Get('report/by-period')
  getArrivalsByPeriod(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.drugArrivalService.arrivalsByPeriod(
      new Date(start),
      new Date(end),
    );
  }

  @Get('report/range')
  getArrivalsReportByRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.drugArrivalService.arrivalsReportByPeriod(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugArrivalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDrugArrivalDto: UpdateDrugArrivalDto,
  ) {
    return this.drugArrivalService.update(id, updateDrugArrivalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugArrivalService.remove(id);
  }

  @Get('report/sum-by-payment-type')
  getSumByPaymentType(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.drugArrivalService.sumByPaymentType(startDate, endDate);
  }

  // Детализированный отчёт по типам оплаты за период
  @Get('report/detailed-by-payment-type')
  getDetailedReportByPaymentType(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.drugArrivalService.detailedReportByPaymentType(
      startDate,
      endDate,
    );
  }

  @Get('report/detailed-arrivals')
  async getDetailedArrivalsReport(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Проверка валидности дат
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.drugArrivalService.detailedArrivalsReport(startDate, endDate);
  }

  @Get('report/expiring-soon-by-payment-type')
  async getExpiringSoonGroupedByPaymentType(
    @Query('daysAhead', ParseIntPipe) daysAhead: number,
  ) {
    if (daysAhead <= 0) {
      throw new BadRequestException('daysAhead must be a positive integer');
    }

    return this.drugArrivalService.expiringSoonGroupedByPaymentType(daysAhead);
  }

  @Get('report/by-payment-type')
  async getArrivalsByPaymentType(
    @Query('paymentType') paymentType: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    if (!paymentType) {
      throw new BadRequestException('paymentType query parameter is required');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.drugArrivalService.arrivalsByPaymentType(
      paymentType,
      startDate,
      endDate,
    );
  }

  @Get('report/sum-and-count-by-payment-type')
  async getSumAndCountByPaymentType(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.drugArrivalService.sumAndCountByPaymentType(startDate, endDate);
  }

  // Получить приходы по конкретному препарату
  @Get('by-drug/:drugId')
  async getArrivalsByDrug(@Param('drugId', ParseIntPipe) drugId: number) {
    return this.drugArrivalService.arrivalsByDrug(drugId);
  }

  // Получить ежедневную статистику по приходу за период
  @Get('report/daily-stats')
  async getDailyStats(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.drugArrivalService.dailyStats(startDate, endDate);
  }
}
