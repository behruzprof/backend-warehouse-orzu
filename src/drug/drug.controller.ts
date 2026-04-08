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
  DefaultValuePipe,
  ParseEnumPipe,
  ParseBoolPipe, // 🆕 ДОБАВЛЕНО: ParseBoolPipe для обработки true/false
} from '@nestjs/common';
import { DrugService } from './drug.service';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { DrugCategory } from './entities/drug.entity';

@Controller('drugs')
export class DrugController {
  constructor(private readonly drugService: DrugService) {}

  @Post()
  create(@Body() createDrugDto: CreateDrugDto) {
    return this.drugService.create(createDrugDto);
  }

  @Get()
  findAll(
    // 🆕 ДОБАВЛЕНО: фильтр для исключения шаблонов
    @Query('excludeTemplate', new DefaultValuePipe(false), ParseBoolPipe) excludeTemplate: boolean,
  ) {
    return this.drugService.findAll(excludeTemplate);
  }

  @Get('paginated')
  findAllPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    // 🆕 ДОБАВЛЕНО: фильтр
    @Query('excludeTemplate', new DefaultValuePipe(false), ParseBoolPipe) excludeTemplate?: boolean,
  ) {
    return this.drugService.findAllPaginated(page, limit, search, excludeTemplate);
  }

  @Get('categories')
  getCategories() {
    return Object.values(DrugCategory);
  }

  @Get('template')
  getStaticTemplate() {
    return this.drugService.getStaticTemplate();
  }

  @Get('by-category')
  findByCategory(
    @Query('category', new ParseEnumPipe(DrugCategory)) category: DrugCategory,
    // 🆕 ДОБАВЛЕНО: фильтр
    @Query('excludeTemplate', new DefaultValuePipe(false), ParseBoolPipe) excludeTemplate?: boolean,
  ) {
    return this.drugService.findByExactCategory(category, excludeTemplate);
  }

  @Get('by-ids')
  async getByIds(
    @Query('ids') ids: string,
    // 🆕 ДОБАВЛЕНО: фильтр
    @Query('excludeTemplate', new DefaultValuePipe(false), ParseBoolPipe) excludeTemplate?: boolean,
  ) {
    const idArray = ids.split(',').map(Number);
    return this.drugService.findByIds(idArray, excludeTemplate);
  }

  @Get('search')
  async search(
    @Query('query') query: string,
    // 🆕 ДОБАВЛЕНО: фильтр
    @Query('excludeTemplate', new DefaultValuePipe(false), ParseBoolPipe) excludeTemplate?: boolean,
  ) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.drugService.searchByName(query.trim(), excludeTemplate);
  }

  @Get('search/all')
  async searchAll(
    @Query('query') query: string,
    // 🆕 ДОБАВЛЕНО: фильтр
    @Query('excludeTemplate', new DefaultValuePipe(false), ParseBoolPipe) excludeTemplate?: boolean,
  ) {
    return this.drugService.searchByNameAndGetAll(query.trim(), excludeTemplate);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    // 🆕 ДОБАВЛЕНО: фильтр
    @Query('excludeTemplate', new DefaultValuePipe(false), ParseBoolPipe) excludeTemplate?: boolean,
  ) {
    return this.drugService.findOne(id, excludeTemplate);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDrugDto: UpdateDrugDto,
  ) {
    return this.drugService.update(id, updateDrugDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.drugService.remove(id);
  }
}