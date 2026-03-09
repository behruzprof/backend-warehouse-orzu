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
  ParseArrayPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { DrugService } from './drug.service';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';

@Controller('drugs')
export class DrugController {
  constructor(private readonly drugService: DrugService) {}

  /**
   * Создание нового лекарства
   * POST /drugs
   */
  @Post()
  create(@Body() createDrugDto: CreateDrugDto) {
    return this.drugService.create(createDrugDto);
  }

  /**
   * Получить все лекарства (с пагинацией и поиском)
   * GET /drugs?page=1&limit=10&search=Аспирин
   */
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.drugService.findAll(page, limit, search);
  }

  /**
   * Получить лекарства по категории
   * GET /drugs/by-category?category=Антибиотики
   */
  @Get('by-category')
  findByCategory(@Query('category') category: string) {
    return this.drugService.findByExactCategory(category);
  }

  /**
   * Получить лекарства по массиву ID (например, для корзины)
   * GET /drugs/by-ids?ids=1,2,3
   */
  @Get('by-ids')
  findByIds(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return this.drugService.findByIds(ids);
  }

  /**
   * Быстрый поиск для подсказок
   * GET /drugs/search?query=пара
   */
  @Get('search')
  async search(@Query('query') query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.drugService.searchByName(query.trim());
  }

  /**
   * Полный поиск без пагинации (если нужно)
   * GET /drugs/search/all?query=пара
   */
  @Get('search/all')
  async searchAll(@Query('query') query: string) {
    return this.drugService.searchByNameAndGetAll(query.trim());
  }

  /**
   * Получить одно лекарство по ID
   * GET /drugs/:id
   * ВАЖНО: динамические параметры (:id) всегда должны быть в конце!
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drugService.findOne(id);
  }

  /**
   * Обновить информацию о лекарстве
   * PATCH /drugs/:id
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
   * DELETE /drugs/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugService.remove(id);
  }
}