import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ✅ Создание нового лекарства
  async create(createDrugDto: CreateDrugDto): Promise<Drug> {
    const {
      name,
      quantity,
      minStock,
      maxStock,
      supplier,
      expiryDate,
      arrivalDate,
      paymentType,
      IsStandard,
      costPerPiece,
      piece,
      ...optionalFields
    } = createDrugDto;

    // 🧮 АВТОВЫЧИСЛЕНИЕ: сумма = штук * цена за штуку
    const calculatedPurchaseAmount = piece * costPerPiece;

    const drug = this.drugRepository.create({
      name,
      quantity,
      minStock,
      maxStock,
      supplier,
      purchaseAmount: calculatedPurchaseAmount,
      IsStandard: IsStandard ?? false,
      costPerPiece,
      piece,
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

  async findAll(): Promise<Drug[]> {
    const dbDrugs = await this.drugRepository.find();
    return [...dbDrugs, ...(template as unknown as Drug[])];
  }

  async findAllPaginated(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Drug> = search
      ? { name: Like(`%${search}%`) }
      : {};

    const [data, total] = await this.drugRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  getStaticTemplate() {
    return template;
  }

  // 🆕 ОБНОВЛЕННЫЙ МЕТОД: Получение лекарств по массиву ID (включая шаблоны)
  async findByIds(ids: number[]): Promise<Drug[]> {
    if (!ids || ids.length === 0) return [];

    // Приводим все ID к числам, если они пришли из query-параметров как строки
    const numericIds = ids.map((id) => Number(id));

    // 1. Ищем в базе данных через TypeORM
    const dbDrugs = await this.drugRepository.find({
      where: {
        id: In(numericIds),
      },
    });

    // 2. Ищем в статическом шаблоне (template)
    // Фильтруем те элементы, чьи ID есть в списке запроса
    const templateDrugs = template
      .filter((item) => numericIds.includes(item.id))
      .map((item) => ({
        ...item,
        // Обязательно конвертируем строки в Date, иначе TypeScript будет ругаться,
        // а логика приложения может сломаться при работе с датами
        expiryDate: new Date(item.expiryDate),
        arrivalDate: new Date(item.arrivalDate),
      })) as unknown as Drug[];

    // 3. Возвращаем объединенный массив
    return [...dbDrugs, ...templateDrugs];
  }

  // ✅ Получить одно лекарство по ID
  async findOne(id: number): Promise<Drug> {
    const drug = await this.drugRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Лекарство с ID ${id} не найдено`);
    }
    return drug;
  }

  // ✅ ИЗМЕНЕНО: Теперь принимаем DrugCategory вместо string
  async findByExactCategory(category: DrugCategory): Promise<Drug[]> {
    return this.drugRepository.find({
      where: { category },
    });
  }

  // ✅ Обновление информации о лекарстве
  async update(id: number, updateDrugDto: UpdateDrugDto): Promise<Drug> {
    const drug = await this.findOne(id);

    // Если при апдейте передают piece и costPerPiece, мы тоже должны пересчитать сумму
    if (
      updateDrugDto.piece !== undefined ||
      updateDrugDto.costPerPiece !== undefined
    ) {
      const newPiece = updateDrugDto.piece ?? drug.piece;
      const newCost = updateDrugDto.costPerPiece ?? drug.costPerPiece;
      drug.purchaseAmount = newPiece * newCost;
    }

    const updated = Object.assign(drug, updateDrugDto);
    return await this.drugRepository.save(updated);
  }

  // ✅ Удаление лекарства по ID
  async remove(id: number): Promise<void> {
    const drug = await this.findOne(id);
    await this.drugRepository.remove(drug);
  }

  // ✅ Поиск по имени с лимитом
  async searchByName(query: string): Promise<Drug[]> {
    return this.drugRepository.find({
      where: { name: Like(`%${query}%`) },
      take: 10,
    });
  }

  // ✅ Поиск по имени без лимита
  async searchByNameAndGetAll(query: string): Promise<Drug[]> {
    return this.drugRepository.find({
      where: { name: Like(`%${query}%`) },
    });
  }
}
