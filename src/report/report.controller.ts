import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiKeyGuard } from 'auth/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() body) {
    return this.reportService.createDailyUsageReport(body.day, body.month, body.year);
  }
}
