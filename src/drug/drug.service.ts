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

  private getFormattedTemplates(): Drug[] {
    return template.map((item) => ({
      ...item,
      expiryDate: new Date(item.expiryDate),
      arrivalDate: new Date(item.arrivalDate),
    })) as unknown as Drug[];
  }

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

  // ✅ ИЗМЕНЕНО: Добавлен параметр excludeTemplate
  async findAll(excludeTemplate: boolean = false): Promise<Drug[]> {
    const dbDrugs = await this.drugRepository.find();
    if (excludeTemplate) {
      return dbDrugs; // Возвращаем только БД
    }
    return [...this.getFormattedTemplates(), ...dbDrugs];
  }

  // ✅ ИЗМЕНЕНО: Обработка флага excludeTemplate для пагинации
  async findAllPaginated(page: number, limit: number, search?: string, excludeTemplate: boolean = false) {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Drug> = search ? { name: Like(`%${search}%`) } : {};

    // 🆕 ДОБАВЛЕНО: Если исключаем шаблоны, просто делаем стандартный запрос в БД
    if (excludeTemplate) {
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

    // --- СТАРЫЙ КОД ДЛЯ СМЕШАННЫХ ДАННЫХ ---
    const formattedTemplates = this.getFormattedTemplates();
    const matchingTemplates = search
      ? formattedTemplates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
      : formattedTemplates;
    
    const templateCount = matchingTemplates.length;

    let templateResults: Drug[] = [];
    let dbSkip = 0;
    let dbTake = limit;

    if (skip < templateCount) {
      templateResults = matchingTemplates.slice(skip, skip + limit);
      dbTake = limit - templateResults.length; 
      dbSkip = 0; 
    } else {
      dbSkip = skip - templateCount;
      dbTake = limit;
    }

    let dbData: Drug[] = [];
    let dbTotal = 0;

    if (dbTake > 0) {
      [dbData, dbTotal] = await this.drugRepository.findAndCount({
        where,
        skip: dbSkip,
        take: dbTake,
        order: { id: 'DESC' },
      });
    } else {
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

  // ✅ ИЗМЕНЕНО: Добавлен excludeTemplate
  async findByIds(ids: number[], excludeTemplate: boolean = false): Promise<Drug[]> {
    if (!ids || ids.length === 0) return [];
    const numericIds = ids.map((id) => Number(id));

    const dbDrugs = await this.drugRepository.find({
      where: { id: In(numericIds) },
    });

    if (excludeTemplate) return dbDrugs;

    const templateDrugs = this.getFormattedTemplates().filter((item) =>
      numericIds.includes(item.id),
    );

    return [...templateDrugs, ...dbDrugs];
  }

  // ✅ ИЗМЕНЕНО: Добавлен excludeTemplate
  async findOne(id: number, excludeTemplate: boolean = false): Promise<Drug> {
    if (!excludeTemplate) {
      const templateItem = this.getFormattedTemplates().find(t => t.id === Number(id));
      if (templateItem) {
        return templateItem;
      }
    }

    const drug = await this.drugRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Лекарство с ID ${id} не найдено`);
    }
    return drug;
  }

  // ✅ ИЗМЕНЕНО: Добавлен excludeTemplate
  async findByExactCategory(category: DrugCategory, excludeTemplate: boolean = false): Promise<Drug[]> {
    const dbDrugs = await this.drugRepository.find({ where: { category } });
    
    if (excludeTemplate) return dbDrugs;

    const templateDrugs = this.getFormattedTemplates().filter(
      (t) => (t.category as unknown as string) === category
    );

    return [...templateDrugs, ...dbDrugs];
  }

  // ✅ ИЗМЕНЕНО: Добавлен excludeTemplate
  async searchByName(query: string, excludeTemplate: boolean = false): Promise<Drug[]> {
    const dbDrugs = await this.drugRepository.find({
      where: { name: Like(`%${query}%`) },
      take: 10,
    });

    if (excludeTemplate) return dbDrugs;

    const templateDrugs = this.getFormattedTemplates().filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()),
    );

    return [...templateDrugs, ...dbDrugs].slice(0, 10);
  }

  // ✅ ИЗМЕНЕНО: Добавлен excludeTemplate
  async searchByNameAndGetAll(query: string, excludeTemplate: boolean = false): Promise<Drug[]> {
    const dbDrugs = await this.drugRepository.find({
      where: { name: Like(`%${query}%`) },
    });

    if (excludeTemplate) return dbDrugs;

    const templateDrugs = this.getFormattedTemplates().filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()),
    );

    return [...templateDrugs, ...dbDrugs];
  }

  async update(id: number, updateDrugDto: UpdateDrugDto): Promise<Drug> {
    const isTemplate = template.some(t => t.id === Number(id));
    if (isTemplate) {
      throw new BadRequestException('Невозможно обновить данные статического шаблона');
    }

    // Передаем excludeTemplate = true, чтобы не искать в шаблонах при апдейте (доп защита)
    const drug = await this.findOne(id, true);

    if (updateDrugDto.piece !== undefined || updateDrugDto.costPerPiece !== undefined) {
      const newPiece = updateDrugDto.piece ?? drug.piece;
      const newCost = updateDrugDto.costPerPiece ?? drug.costPerPiece;
      drug.purchaseAmount = newPiece * newCost;
    }

    const updated = Object.assign(drug, updateDrugDto);
    return await this.drugRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const isTemplate = template.some(t => t.id === Number(id));
    if (isTemplate) {
      throw new BadRequestException('Невозможно удалить статический шаблон');
    }

    // Передаем excludeTemplate = true
    const drug = await this.findOne(id, true);
    await this.drugRepository.remove(drug);
  }
}