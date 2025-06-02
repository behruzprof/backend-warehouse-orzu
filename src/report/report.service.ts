import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

import { Drug } from 'drug/entities/drug.entity';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { TelegramService } from 'telegram/telegram.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly telegramService: TelegramService,

    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,

    @InjectRepository(DrugRequest)
    private readonly drugRequestRepository: Repository<DrugRequest>,

    @InjectRepository(DrugArrival)
    private readonly drugArrivalRepository: Repository<DrugArrival>,
  ) {}

  async create(month: number, year: number) {
    const drugs = await this.drugRepository.find();
    const arrivals = await this.drugArrivalRepository.find({
      relations: ['drug'],
    });
    const requests = await this.drugRequestRepository.find({
      relations: ['drug'],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Отчёт');

    const daysInMonth = new Date(year, month, 0).getDate();
    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString(),
    );

    const headers = [
      '№',
      'Название лекарства',
      'Ед. изм.',
      'Остаток кол-во',
      'Остаток сумма',
      'Приход кол-во',
      'Приход сумма',
      'Сумма без НДС',
      ...dayHeaders,
      'Общий расход',
      'Остаток',
      'Сумма',
      'Ост. след. месяц',
      'Сумма',
    ];
    sheet.addRow(headers);

    drugs.forEach((drug, index) => {
      const row: (string | number)[] = [index + 1, drug.name, 'шт'];

      const prevStockQty = drug.quantity ?? 0;
      const prevStockSum = (drug.purchaseAmount ?? 0) * prevStockQty;
      row.push(prevStockQty, prevStockSum);

      const arrivalsForDrug = arrivals.filter(
        (arrival) =>
          arrival.drug.id === drug.id &&
          new Date(arrival.arrivalDate).getMonth() + 1 === month &&
          new Date(arrival.arrivalDate).getFullYear() === year,
      );

      const arrivalQty = arrivalsForDrug.reduce(
        (sum, a) => sum + a.quantity,
        0,
      );
      const arrivalSum = arrivalsForDrug.reduce(
        (sum, a) => sum + Number(a.purchaseAmount),
        0,
      );

      const sumWithoutNDS = +(arrivalSum / 1.12).toFixed(2);
      row.push(arrivalQty, arrivalSum, sumWithoutNDS);

      const daily = Array(daysInMonth).fill(0);
      requests.forEach((req) => {
        const date = new Date(req.createdAt);
        if (
          req.drug.id === drug.id &&
          date.getMonth() + 1 === month &&
          date.getFullYear() === year
        ) {
          const day = date.getDate() - 1;
          daily[day] += req.quantity;
        }
      });
      row.push(...daily);

      const totalSpent = daily.reduce((a, b) => a + b, 0);
      const finalStock = prevStockQty + arrivalQty - totalSpent;
      row.push(totalSpent, finalStock, '', finalStock, '');

      sheet.addRow(row);
    });

    const reportsDir = path.resolve(__dirname, '..', '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, `report-${year}-${month}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    await this.telegramService.sendFile(filePath, `Отчёт за ${month}/${year}.xlsx`);
  }
}