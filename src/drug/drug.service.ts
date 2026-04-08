import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, In, FindOptionsWhere } from 'typeorm';
import { Drug, DrugCategory } from './entities/drug.entity';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { template } from './template';

@Injectable()
export class DrugService {
  constructor(
    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,
    @InjectRepository(DrugArrival)
    private readonly drugArrivalRepository: Repository<DrugArrival>,
  ) {}

  // 🛠 ВСПОМОГАТЕЛЬНЫЙ МЕТОД: Приводим шаблоны к нужному типу (строки в даты)
  private getFormattedTemplates(): Drug[] {
    return template.map((item) => ({
      ...item,
      expiryDate: new Date(item.expiryDate),
      arrivalDate: new Date(item.arrivalDate),
    })) as unknown as Drug[];
  }

  // ✅ Создание нового лекарства
  async create(createDrugDto: CreateDrugDto): Promise<Drug> {
    const {
      name, quantity, minStock, maxStock, supplier,
      expiryDate, arrivalDate, paymentType, 
      IsStandard, costPerPiece, piece, ...optionalFields
    } = createDrugDto;

    const calculatedPurchaseAmount = piece * costPerPiece;

    const drug = this.drugRepository.create({
      name, quantity, minStock, maxStock, supplier,
      purchaseAmount: calculatedPurchaseAmount,
      IsStandard: IsStandard ?? false,
      costPerPiece, piece,
      expiryDate: new Date(expiryDate),
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      ...optionalFields,
    });

    const savedDrug = await this.drugRepository.save(drug);

    const drugArrival = this.drugArrivalRepository.create({
      drug: savedDrug,
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      expiryDate: new Date(expiryDate),
      quantity,
      purchaseAmount: calculatedPurchaseAmount,
      supplier,
      paymentType,
    });
    await this.drugArrivalRepository.save(drugArrival);

    return savedDrug;
  }

  // ✅ Получить все лекарства (без пагинации, объединяет БД и шаблоны)
  async findAll(): Promise<Drug[]> {
    const dbDrugs = await this.drugRepository.find();
    return [...this.getFormattedTemplates(), ...dbDrugs];
  }

  // ✅ Получить все лекарства (с пагинацией и поиском по БД и шаблонам)
  async findAllPaginated(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    // 1. Ищем и фильтруем в шаблонах
    const formattedTemplates = this.getFormattedTemplates();
    const matchingTemplates = search
      ? formattedTemplates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
      : formattedTemplates;
    
    const templateCount = matchingTemplates.length;

    // 2. Рассчитываем, сколько элементов брать из шаблонов, а сколько из БД
    let templateResults: Drug[] = [];
    let dbSkip = 0;
    let dbTake = limit;

    if (skip < templateCount) {
      // Если мы еще на первых страницах и захватываем шаблоны
      templateResults = matchingTemplates.slice(skip, skip + limit);
      dbTake = limit - templateResults.length; // Остаток добираем из БД
      dbSkip = 0; // Начинаем БД с самого начала
    } else {
      // Если шаблоны закончились, листаем только БД
      dbSkip = skip - templateCount;
      dbTake = limit;
    }

    // 3. Запрашиваем из БД с пересчитанными limit и offset
    let dbData: Drug[] = [];
    let dbTotal = 0;

    const where: FindOptionsWhere<Drug> = search ? { name: Like(`%${search}%`) } : {};

    if (dbTake > 0) {
      [dbData, dbTotal] = await this.drugRepository.findAndCount({
        where,
        skip: dbSkip,
        take: dbTake,
        order: { id: 'DESC' },
      });
    } else {
      // Если мы берем только из шаблонов, нам все равно нужно знать общее количество записей в БД для расчета totalPages
      dbTotal = await this.drugRepository.count({ where });
    }

    const total = templateCount + dbTotal;

    return {
      data: [...templateResults, ...dbData],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  getStaticTemplate() {
    return template;
  }

  // ✅ Получение лекарств по массиву ID
  async findByIds(ids: number[]): Promise<Drug[]> {
    if (!ids || ids.length === 0) return [];
    const numericIds = ids.map((id) => Number(id));

    const dbDrugs = await this.drugRepository.find({
      where: { id: In(numericIds) },
    });

    const templateDrugs = this.getFormattedTemplates().filter((item) =>
      numericIds.includes(item.id),
    );

    return [...templateDrugs, ...dbDrugs];
  }

  // ✅ Получить одно лекарство по ID (сначала проверяем шаблон, потом БД)
  async findOne(id: number): Promise<Drug> {
    const templateItem = this.getFormattedTemplates().find(t => t.id === Number(id));
    if (templateItem) {
      return templateItem;
    }

    const drug = await this.drugRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Лекарство с ID ${id} не найдено`);
    }
    return drug;
  }

  // ✅ Поиск по категории (БД + шаблоны)
  async findByExactCategory(category: DrugCategory): Promise<Drug[]> {
    const dbDrugs = await this.drugRepository.find({ where: { category } });
    
    // В шаблонах категория пока строковая, сравниваем как строки
    const templateDrugs = this.getFormattedTemplates().filter(
      (t) => (t.category as unknown as string) === category
    );

    return [...templateDrugs, ...dbDrugs];
  }

  // ✅ Поиск по имени с лимитом
  async searchByName(query: string): Promise<Drug[]> {
    const templateDrugs = this.getFormattedTemplates().filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()),
    );

    const dbDrugs = await this.drugRepository.find({
      where: { name: Like(`%${query}%`) },
      take: 10,
    });

    // Объединяем и обрезаем до нужного лимита
    return [...templateDrugs, ...dbDrugs].slice(0, 10);
  }

  // ✅ Поиск по имени без лимита
  async searchByNameAndGetAll(query: string): Promise<Drug[]> {
    const templateDrugs = this.getFormattedTemplates().filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()),
    );

    const dbDrugs = await this.drugRepository.find({
      where: { name: Like(`%${query}%`) },
    });

    return [...templateDrugs, ...dbDrugs];
  }

  // ✅ Обновление информации о лекарстве
  async update(id: number, updateDrugDto: UpdateDrugDto): Promise<Drug> {
    const isTemplate = template.some(t => t.id === Number(id));
    if (isTemplate) {
      throw new BadRequestException('Невозможно обновить данные статического шаблона');
    }

    const drug = await this.findOne(id);

    if (updateDrugDto.piece !== undefined || updateDrugDto.costPerPiece !== undefined) {
      const newPiece = updateDrugDto.piece ?? drug.piece;
      const newCost = updateDrugDto.costPerPiece ?? drug.costPerPiece;
      drug.purchaseAmount = newPiece * newCost;
    }

    const updated = Object.assign(drug, updateDrugDto);
    return await this.drugRepository.save(updated);
  }

  // ✅ Удаление лекарства по ID
  async remove(id: number): Promise<void> {
    const isTemplate = template.some(t => t.id === Number(id));
    if (isTemplate) {
      throw new BadRequestException('Невозможно удалить статический шаблон');
    }

    const drug = await this.findOne(id);
    await this.drugRepository.remove(drug);
  }
}