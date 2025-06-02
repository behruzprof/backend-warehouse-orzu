import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { DrugRequestService } from './drug-request.service';
import { CreateDrugRequestDto } from './dto/create-drug-request.dto';
import { UpdateDrugRequestDto } from './dto/update-drug-request.dto';

@Controller('drug-requests')
export class DrugRequestController {
  constructor(private readonly drugRequestService: DrugRequestService) {}

  @Post()
  create(@Body() createDto: CreateDrugRequestDto[]) {
    return this.drugRequestService.create(createDto);
  }

  @Get()
  findAll() {
    return this.drugRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugRequestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDrugRequestDto,
  ) {
    return this.drugRequestService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugRequestService.remove(id);
  }

  @Get('report/by-department')
  getReportByDepartment() {
    return this.drugRequestService.getReportByDepartment();
  }

  @Get('report/by-drug/:drugId')
  getReportByDrug(@Param('drugId', ParseIntPipe) drugId: number) {
    return this.drugRequestService.getReportByDrug(drugId);
  }

  @Get('report/by-patient')
  getReportByPatient() {
    return this.drugRequestService.getReportByPatient();
  }
}
