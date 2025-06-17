import { Controller, Post, Body, Delete, Param, Get } from '@nestjs/common';
import { DraftOrderService } from './draft-order.service';
import { CreateDraftOrderDto } from './dto/create-draft-order.dto';

@Controller('draft-order')
export class DraftOrderController {
  constructor(private readonly draftOrderService: DraftOrderService) {}

  @Post()
  create(@Body() createDraftOrderDto: CreateDraftOrderDto) {
    return this.draftOrderService.create(createDraftOrderDto);
  }

  @Get()
  findAll() {
    return this.draftOrderService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.draftOrderService.removeById(id);
  }

  @Delete()
  removeAll() {
    return this.draftOrderService.removeAll();
  }

  @Post('sync-to-drug-order')
   syncToDrugOrder() {
    return this.draftOrderService.ensureDrugExists();
  }
}
