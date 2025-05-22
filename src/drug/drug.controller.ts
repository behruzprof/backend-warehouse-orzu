import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
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

  @Get('by-category')
  findByCategory(@Query('category') category: string) {
    return this.drugService.findByExactCategory(category);
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

  @Get('search')
  async search(@Query('query') query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.drugService.searchByName(query.trim());
  }

  @Get('search/all')
  async searchAll(@Query('query') query: string) {
    return this.drugService.searchByNameAndGetAll(query.trim());
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
