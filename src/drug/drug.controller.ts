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
  ParseEnumPipe, // 🆕 ДОБАВЛЕНО: ParseEnumPipe
  // UseGuards,
} from '@nestjs/common';
import { DrugService } from './drug.service';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
// import { ApiKeyGuard } from 'auth/api-key.guard';
import { DrugCategory } from './entities/drug.entity'; // 🆕 ДОБАВЛЕНО: Импорт Enum

// @UseGuards(ApiKeyGuard)
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
   * ⏪ СТАРЫЙ МЕТОД: Получить все лекарства единым списком
   * GET /drugs
   */
  @Get()
  findAll() {
    return this.drugService.findAll();
  }

  /**
   * 🆕 НОВЫЙ МЕТОД: Получить все лекарства (с пагинацией и поиском)
   * GET /drugs/paginated?page=1&limit=10&search=Аспирин
   */
  @Get('paginated')
  findAllPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.drugService.findAllPaginated(page, limit, search);
  }

  @Get('categories')
  getCategories() {
    return Object.values(DrugCategory);
  }

  @Get('template')
  getStaticTemplate() {
    return this.drugService.getStaticTemplate();
  }

  /**
   * Получить лекарства по категории
   * GET /drugs/by-category?category=Антибиотики
   */
  @Get('by-category')
  findByCategory(
    // ✅ ИЗМЕНЕНО: Добавлена строгая проверка через ParseEnumPipe
    @Query('category', new ParseEnumPipe(DrugCategory)) category: DrugCategory,
  ) {
    return this.drugService.findByExactCategory(category);
  }

  /**
   * 🆕 НОВЫЙ МЕТОД: Получить лекарства по массиву ID
   * GET /drugs/by-ids?ids=1,2,3
   */
  @Get('by-ids')
  async getByIds(@Query('ids') ids: string) {
    const idArray = ids.split(',').map(Number);
    return this.drugService.findByIds(idArray);
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
