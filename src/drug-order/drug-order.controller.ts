import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DrugOrderService } from './drug-order.service';
import { CreateDrugOrderDto } from './dto/create-drug-order.dto';
import { ApiKeyGuard } from 'auth/api-key.guard';

@Controller('drug-order')
@UseGuards(ApiKeyGuard)
export class DrugOrderController {
  constructor(private readonly drugOrderService: DrugOrderService) {}

  @Post()
  create(@Body() createDrugOrderDto: CreateDrugOrderDto[]) {
    return this.drugOrderService.create(createDrugOrderDto);
  }
}
