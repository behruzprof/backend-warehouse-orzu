import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
}
