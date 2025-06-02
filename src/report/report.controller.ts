import { Controller, Post, Body } from '@nestjs/common';
import { ReportService } from './report.service';
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() body) {
    return this.reportService.create(body.month, body.year);
  }
}
