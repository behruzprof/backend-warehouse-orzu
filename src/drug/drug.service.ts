import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, In, FindOptionsWhere } from 'typeorm';
import { Drug } from './entities/drug.entity';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';

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
      name, quantity, minStock, maxStock, supplier,
      purchaseAmount, expiryDate, arrivalDate, paymentType, ...optionalFields
    } = createDrugDto;

    const drug = this.drugRepository.create({
      name, quantity, minStock, maxStock, supplier, purchaseAmount,
      expiryDate: new Date(expiryDate),
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      ...optionalFields,
    });
    const savedDrug = await this.drugRepository.save(drug);

    const drugArrival = this.drugArrivalRepository.create({
      drug: savedDrug,
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      expiryDate: new Date(expiryDate), quantity, purchaseAmount, supplier, paymentType,
    });
    await this.drugArrivalRepository.save(drugArrival);

    return savedDrug;
  }

  // ⏪ СТАРЫЙ МЕТОД: Получить все лекарства (без пагинации, как было раньше)
  async findAll(): Promise<Drug[]> {
    return await this.drugRepository.find();
  }

  // 🆕 НОВЫЙ МЕТОД: Получить все лекарства (с пагинацией и опциональным поиском)
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

  // 🆕 НОВЫЙ МЕТОД: Получение лекарств по массиву ID
  async findByIds(ids: number[]): Promise<Drug[]> {
    if (!ids || ids.length === 0) return [];
    
    return this.drugRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  // ✅ Получить одно лекарство по ID
  async findOne(id: number): Promise<Drug> {
    const drug = await this.drugRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Лекарство с ID ${id} не найдено`);
    }
    return drug;
  }

  // ✅ Получить по точной категории
  async findByExactCategory(category: string): Promise<Drug[]> {
    return this.drugRepository.find({
      where: { category },
    });
  }

  // ✅ Обновление информации о лекарстве
  async update(id: number, updateDrugDto: UpdateDrugDto): Promise<Drug> {
    const drug = await this.findOne(id);
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