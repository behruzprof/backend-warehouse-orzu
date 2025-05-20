import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DrugService } from './drug.service';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';

@Controller('drugs')
export class DrugController {
  constructor(private readonly drugService: DrugService) {}

  /**
   * Создание нового лекарства
   * POST /drug
   * Тело запроса должно соответствовать CreateDrugDto
   */
  @Post()
  create(@Body() createDrugDto: CreateDrugDto) {
    return this.drugService.create(createDrugDto);
  }

  /**
   * Получить все лекарства
   * GET /drug
   */
  @Get()
  findAll() {
    return this.drugService.findAll();
  }

  /**
   * Получить одно лекарство по ID
   * GET /drug/:id
   * Используем ParseIntPipe для преобразования id из строки в число
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugService.findOne(id);
  }

  /**
   * Обновить информацию о лекарстве
   * PATCH /drug/:id
   * Тело запроса должно соответствовать UpdateDrugDto
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDrugDto: UpdateDrugDto,
  ) {
    return this.drugService.update(id, updateDrugDto);
  }

  /**
   * Удалить лекарство
   * DELETE /drug/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugService.remove(id);
  }
}
