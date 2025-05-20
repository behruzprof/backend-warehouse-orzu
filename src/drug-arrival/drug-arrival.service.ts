import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';

import { DrugArrival } from './entities/drug-arrival.entity';
import { Drug } from '../drug/entities/drug.entity';
import { CreateDrugArrivalDto } from './dto/create-drug-arrival.dto';
import { UpdateDrugArrivalDto } from './dto/update-drug-arrival.dto';

@Injectable()
export class DrugArrivalService {
  constructor(
    @InjectRepository(DrugArrival)
    private readonly drugArrivalRepository: Repository<DrugArrival>,

    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,
  ) {}

  // Добавление прихода и обновление количества
  async create(createDto: CreateDrugArrivalDto): Promise<DrugArrival> {
    // Найти лекарство по id
    const drug = await this.drugRepository.findOne({
      where: { id: createDto.drugId },
    });
    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    // Создать новую запись прихода
    const arrival = this.drugArrivalRepository.create({
      drug,
      quantity: createDto.quantity,
      purchaseAmount: createDto.purchaseAmount,
      arrivalDate: createDto.arrivalDate,
      expiryDate: createDto.expiryDate,
      supplier: createDto.supplier,
    });

    // Сохраняем приход
    const savedArrival = await this.drugArrivalRepository.save(arrival);

    // Обновляем общее количество в лекарстве
    drug.quantity += createDto.quantity;
    await this.drugRepository.save(drug);

    return savedArrival;
  }

  // Получить все приходы (опционально с фильтрами)
  findAll(): Promise<DrugArrival[]> {
    return this.drugArrivalRepository.find({ relations: ['drug'] });
  }

  // Найти приход по id
  findOne(id: number): Promise<DrugArrival | null> {
    return this.drugArrivalRepository.findOne({
      where: { id },
      relations: ['drug'],
    });
  }

  // Обновить приход (например, изменить количество или дату)
  async update(
    id: number,
    updateDto: UpdateDrugArrivalDto,
  ): Promise<DrugArrival> {
    const arrival = await this.drugArrivalRepository.findOne({
      where: { id },
      relations: ['drug'],
    });
    if (!arrival) {
      throw new NotFoundException('DrugArrival not found');
    }

    // Если меняется количество, обновим остаток в Drug
    if (
      updateDto.quantity !== undefined &&
      updateDto.quantity !== arrival.quantity
    ) {
      const diff = updateDto.quantity - arrival.quantity;
      arrival.drug.quantity += diff;
      await this.drugRepository.save(arrival.drug);
    }

    Object.assign(arrival, updateDto);
    return this.drugArrivalRepository.save(arrival);
  }

  // Удалить приход
  async remove(id: number): Promise<void> {
    const arrival = await this.drugArrivalRepository.findOne({
      where: { id },
      relations: ['drug'],
    });
    if (!arrival) {
      throw new NotFoundException('DrugArrival not found');
    }

    // Уменьшаем общее количество в Drug
    arrival.drug.quantity -= arrival.quantity;
    if (arrival.drug.quantity < 0) arrival.drug.quantity = 0;
    await this.drugRepository.save(arrival.drug);

    await this.drugArrivalRepository.remove(arrival);
  }

  // Отчёт: приходы за период
  async arrivalsByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<DrugArrival[]> {
    return this.drugArrivalRepository.find({
      where: {
        arrivalDate: Between(startDate, endDate),
      },
      relations: ['drug'],
    });
  }

  // Отчёт: суммы по поставщикам за период
  async sumBySupplier(
    startDate: Date,
    endDate: Date,
  ): Promise<{ supplier: string; totalAmount: number }[]> {
    const result = await this.drugArrivalRepository
      .createQueryBuilder('arrival')
      .select('arrival.supplier', 'supplier')
      .addSelect('SUM(arrival.purchaseAmount)', 'totalAmount')
      .where('arrival.arrivalDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('arrival.supplier')
      .getRawMany();

    // totalAmount приходит строкой, преобразуем в число
    return result.map((r) => ({
      supplier: r.supplier,
      totalAmount: parseFloat(r.totalAmount),
    }));
  }

  // Отчёт: остатки по срокам годности (например, партии, срок годности которых скоро истекает)
  async expiringSoon(daysAhead: number): Promise<DrugArrival[]> {
    const now = new Date();
    const limitDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return this.drugArrivalRepository.find({
      where: {
        expiryDate: LessThanOrEqual(limitDate),
      },
      relations: ['drug'],
      order: { expiryDate: 'ASC' },
    });
  }
}
