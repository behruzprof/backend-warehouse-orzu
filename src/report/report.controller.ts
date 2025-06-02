import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create() {
    return this.reportService.create();
  }
}
