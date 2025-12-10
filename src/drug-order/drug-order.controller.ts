import { Controller, Post, Body } from '@nestjs/common';
import { DrugOrderService } from './drug-order.service';
import { CreateDrugOrderDto } from './dto/create-drug-order.dto';

@Controller('drug-order')
export class DrugOrderController {
  constructor(private readonly drugOrderService: DrugOrderService) {}

  @Post()
  create(@Body() createDrugOrderDto: CreateDrugOrderDto[]) {
    return this.drugOrderService.create(createDrugOrderDto);
  }
}
