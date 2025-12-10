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
      paymentType: createDto.paymentType,
    });

    // Сохраняем приход
    const savedArrival = await this.drugArrivalRepository.save(arrival);

    // Обновляем общее количество в лекарстве
    drug.quantity += createDto.quantity;
    drug.purchaseAmount = createDto.purchaseAmount;
    // Обновляем цену закупки
    drug.expiryDate = new Date(createDto.expiryDate); // Обновляем срок годности
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

  async arrivalsReportByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalQuantity: number;
    totalAmount: number;
    averagePurchasePrice: number;
    batchCount: number;
    arrivals: DrugArrival[];
    suppliers: {
      name: string;
      totalAmount: number;
      totalQuantity: number;
    }[];
    stockByDrug: {
      drugName: string;
      quantity: number;
    }[];
  }> {
    const arrivals = await this.drugArrivalRepository.find({
      where: {
        arrivalDate: Between(startDate, endDate),
      },
      relations: ['drug'],
    });

    let totalQuantity = 0;
    let totalAmount = 0;
    const suppliersMap = new Map<
      string,
      { totalAmount: number; totalQuantity: number }
    >();

    for (const arrival of arrivals) {
      totalQuantity += arrival.quantity;
      totalAmount += Number(arrival.purchaseAmount);

      if (!suppliersMap.has(arrival.supplier)) {
        suppliersMap.set(arrival.supplier, {
          totalAmount: 0,
          totalQuantity: 0,
        });
      }

      const supplierData = suppliersMap.get(arrival.supplier)!;
      supplierData.totalAmount += Number(arrival.purchaseAmount);
      supplierData.totalQuantity += arrival.quantity;
    }

    const batchCount = arrivals.length;
    const averagePurchasePrice =
      totalQuantity > 0 ? Number((totalAmount / totalQuantity).toFixed(2)) : 0;

    // Остатки на складе по каждому препарату
    const allDrugs = await this.drugRepository.find();
    const stockByDrug = allDrugs.map((drug) => ({
      drugName: drug.name,
      quantity: drug.quantity,
    }));

    return {
      totalQuantity,
      totalAmount,
      averagePurchasePrice,
      batchCount,
      arrivals,
      suppliers: Array.from(suppliersMap.entries()).map(([name, data]) => ({
        name,
        ...data,
      })),
      stockByDrug,
    };
  }

  async arrivalsByDrug(drugId: number): Promise<DrugArrival[]> {
    return this.drugArrivalRepository.find({
      where: { drug: { id: drugId } },
      relations: ['drug'],
      order: { arrivalDate: 'DESC' },
    });
  }

  async dailyStats(
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; quantity: number }[]> {
    const result = await this.drugArrivalRepository
      .createQueryBuilder('arrival')
      .select('DATE(arrival.arrivalDate)', 'date')
      .addSelect('SUM(arrival.quantity)', 'quantity')
      .where('arrival.arrivalDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('DATE(arrival.arrivalDate)')
      .orderBy('DATE(arrival.arrivalDate)', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      date: r.date,
      quantity: Number(r.quantity),
    }));
  }

  // Отчёт: суммы и количество по типам оплаты за период
  async sumAndCountByPaymentType(
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      paymentType: string;
      totalAmount: number;
      totalQuantity: number;
      batchCount: number;
    }[]
  > {
    const result = await this.drugArrivalRepository
      .createQueryBuilder('arrival')
      .select('arrival.paymentType', 'paymentType')
      .addSelect('SUM(arrival.purchaseAmount)', 'totalAmount')
      .addSelect('SUM(arrival.quantity)', 'totalQuantity')
      .addSelect('COUNT(arrival.id)', 'batchCount')
      .where('arrival.arrivalDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('arrival.paymentType')
      .getRawMany();

    return result.map((r) => ({
      paymentType: r.paymentType,
      totalAmount: parseFloat(r.totalAmount),
      totalQuantity: parseFloat(r.totalQuantity),
      batchCount: parseInt(r.batchCount, 10),
    }));
  }

  // Отчёт: приходы по типу оплаты за период с детализацией
  async arrivalsByPaymentType(
    paymentType: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DrugArrival[]> {
    return this.drugArrivalRepository.find({
      where: {
        paymentType,
        arrivalDate: Between(startDate, endDate),
      },
      relations: ['drug'],
      order: { arrivalDate: 'DESC' },
    });
  }

  // Остатки по срокам годности с группировкой по типу оплаты
  async expiringSoonGroupedByPaymentType(daysAhead: number): Promise<
    {
      paymentType: string;
      arrivals: DrugArrival[];
    }[]
  > {
    const now = new Date();
    const limitDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // Сначала берем все партии с истекающим сроком
    const arrivals = await this.drugArrivalRepository.find({
      where: {
        expiryDate: LessThanOrEqual(limitDate),
      },
      relations: ['drug'],
      order: { expiryDate: 'ASC' },
    });

    // Группируем по paymentType
    const grouped = arrivals.reduce(
      (acc, arrival) => {
        if (!acc[arrival.paymentType]) acc[arrival.paymentType] = [];
        acc[arrival.paymentType].push(arrival);
        return acc;
      },
      {} as Record<string, DrugArrival[]>,
    );

    return Object.entries(grouped).map(([paymentType, arrivals]) => ({
      paymentType,
      arrivals,
    }));
  }

  // Расширенный отчёт по приходу с разбивкой по типам оплаты и поставщикам
  async detailedArrivalsReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalQuantity: number;
    totalAmount: number;
    averagePurchasePrice: number;
    batchCount: number;

    bySupplier: {
      supplier: string;
      totalAmount: number;
      totalQuantity: number;
    }[];

    byPaymentType: {
      paymentType: string;
      totalAmount: number;
      totalQuantity: number;
      batchCount: number;
    }[];

    stockByDrug: {
      drugName: string;
      quantity: number;
    }[];
  }> {
    const arrivals = await this.drugArrivalRepository.find({
      where: { arrivalDate: Between(startDate, endDate) },
      relations: ['drug'],
    });

    let totalQuantity = 0;
    let totalAmount = 0;
    const suppliersMap = new Map<
      string,
      { totalAmount: number; totalQuantity: number }
    >();
    const paymentTypeMap = new Map<
      string,
      { totalAmount: number; totalQuantity: number; batchCount: number }
    >();

    for (const arrival of arrivals) {
      totalQuantity += arrival.quantity;
      totalAmount += Number(arrival.purchaseAmount);

      // По поставщикам
      if (!suppliersMap.has(arrival.supplier)) {
        suppliersMap.set(arrival.supplier, {
          totalAmount: 0,
          totalQuantity: 0,
        });
      }
      const supData = suppliersMap.get(arrival.supplier)!;
      supData.totalAmount += Number(arrival.purchaseAmount);
      supData.totalQuantity += arrival.quantity;

      // По типам оплаты
      if (!paymentTypeMap.has(arrival.paymentType)) {
        paymentTypeMap.set(arrival.paymentType, {
          totalAmount: 0,
          totalQuantity: 0,
          batchCount: 0,
        });
      }
      const payData = paymentTypeMap.get(arrival.paymentType)!;
      payData.totalAmount += Number(arrival.purchaseAmount);
      payData.totalQuantity += arrival.quantity;
      payData.batchCount++;
    }

    const batchCount = arrivals.length;
    const averagePurchasePrice =
      totalQuantity > 0 ? Number((totalAmount / totalQuantity).toFixed(2)) : 0;

    // Остатки по препаратам
    const allDrugs = await this.drugRepository.find();
    const stockByDrug = allDrugs.map((drug) => ({
      drugName: drug.name,
      quantity: drug.quantity,
    }));

    return {
      totalQuantity,
      totalAmount,
      averagePurchasePrice,
      batchCount,
      bySupplier: Array.from(suppliersMap.entries()).map(
        ([supplier, data]) => ({
          supplier,
          ...data,
        }),
      ),
      byPaymentType: Array.from(paymentTypeMap.entries()).map(
        ([paymentType, data]) => ({
          paymentType,
          ...data,
        }),
      ),
      stockByDrug,
    };
  }

  // Отчёт: суммы по типам оплаты за период
  async sumByPaymentType(
    startDate: Date,
    endDate: Date,
  ): Promise<{ paymentType: string; totalAmount: number }[]> {
    const result = await this.drugArrivalRepository
      .createQueryBuilder('arrival')
      .select('arrival.paymentType', 'paymentType')
      .addSelect('SUM(arrival.purchaseAmount)', 'totalAmount')
      .where('arrival.arrivalDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('arrival.paymentType')
      .getRawMany();

    return result.map((r) => ({
      paymentType: r.paymentType,
      totalAmount: parseFloat(r.totalAmount),
    }));
  }

  // Отчёт: количество и сумма по каждому типу оплаты за период
  async detailedReportByPaymentType(
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      paymentType: string;
      totalAmount: number;
      totalQuantity: number;
      batchCount: number;
    }[]
  > {
    const result = await this.drugArrivalRepository
      .createQueryBuilder('arrival')
      .select('arrival.paymentType', 'paymentType')
      .addSelect('SUM(arrival.purchaseAmount)', 'totalAmount')
      .addSelect('SUM(arrival.quantity)', 'totalQuantity')
      .addSelect('COUNT(arrival.id)', 'batchCount')
      .where('arrival.arrivalDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('arrival.paymentType')
      .getRawMany();

    return result.map((r) => ({
      paymentType: r.paymentType,
      totalAmount: parseFloat(r.totalAmount),
      totalQuantity: parseInt(r.totalQuantity, 10),
      batchCount: parseInt(r.batchCount, 10),
    }));
  }
}
