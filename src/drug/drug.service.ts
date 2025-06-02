import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Drug } from './entities/drug.entity';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';

@Injectable()
export class DrugService {
  // Внедрение репозитория сущности Drug
  constructor(
    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,
    @InjectRepository(DrugArrival)
    private readonly drugArrivalRepository: Repository<DrugArrival>,
  ) {}

  // ✅ Создание нового лекарства
  async create(
    createDrugDto: CreateDrugDto
  ): Promise<Drug> {
    const {
      name,
      quantity,
      minStock,
      maxStock,
      supplier,
      purchaseAmount,
      expiryDate,
      arrivalDate,
      paymentType,
      ...optionalFields
    } = createDrugDto;

    // Шаг 1: создаем лекарство
    const drug = this.drugRepository.create({
      name,
      quantity,
      minStock,
      maxStock,
      supplier,
      purchaseAmount,
      expiryDate: new Date(expiryDate),
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      ...optionalFields,
    });

    const savedDrug = await this.drugRepository.save(drug);

    // Шаг 2: создаем запись о приходе
    const drugArrival = this.drugArrivalRepository.create({
      drug: savedDrug,
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      expiryDate: new Date(expiryDate),
      quantity,
      purchaseAmount,
      supplier,
      paymentType,
    });

    await this.drugArrivalRepository.save(drugArrival);

    return savedDrug;
  }

  // ✅ Получить все лекарства
  async findAll(): Promise<Drug[]> {
    return await this.drugRepository.find();
  }

  // ✅ Получить одно лекарство по ID
  async findOne(id: number): Promise<Drug> {
    const drug = await this.drugRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Лекарство с ID ${id} не найдено`);
    }
    return drug;
  }

  async findByExactCategory(category: string): Promise<Drug[]> {
    return this.drugRepository.find({
      where: { category },
    });
  }

  // ✅ Обновление информации о лекарстве
  async update(id: number, updateDrugDto: UpdateDrugDto): Promise<Drug> {
    const drug = await this.findOne(id); // Проверка на существование
    const updated = Object.assign(drug, updateDrugDto); // Обновление данных
    return await this.drugRepository.save(updated); // Сохранение
  }

  // ✅ Удаление лекарства по ID
  async remove(id: number): Promise<void> {
    const drug = await this.findOne(id); // Проверка на существование
    await this.drugRepository.remove(drug); // Удаление
  }

  async searchByName(query: string): Promise<Drug[]> {
    return this.drugRepository.find({
      where: {
        name: Like(`%${query}%`), // Для PostgreSQL. Для MySQL может быть просто Like
      },
      take: 10, // Ограничиваем количество подсказок
    });
  }

  async searchByNameAndGetAll(query: string): Promise<Drug[]> {
    return this.drugRepository.find({
      where: {
        name: Like(`%${query}%`), // Для PostgreSQL. Для MySQL может быть просто Like
      },
    });
  }
}
