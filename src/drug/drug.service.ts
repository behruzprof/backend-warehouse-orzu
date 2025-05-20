import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drug } from './entities/drug.entity';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';

@Injectable()
export class DrugService {
  // Внедрение репозитория сущности Drug
  constructor(
    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,
  ) {}

  // ✅ Создание нового лекарства
  async create(createDrugDto: CreateDrugDto): Promise<Drug> {
    const drug = this.drugRepository.create(createDrugDto);
    return await this.drugRepository.save(drug);
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
}
