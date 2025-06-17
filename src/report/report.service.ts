import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { TelegramService } from 'telegram/telegram.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly telegramService: TelegramService,
    @InjectRepository(DrugRequest)
    private readonly drugRequestRepository: Repository<DrugRequest>,
  ) {}

  async createDailyUsageReport(day: string, month: string, year: string) {
    const date = new Date(`${year}-${month}-${day}`);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const requests = await this.drugRequestRepository.find({
      relations: ['department', 'drug'],
      where: {
        createdAt: Between(date, nextDate),
      },
    });

    const departmentsMap = new Map<number, string>();
    const drugsMap = new Map<number, string>();

    requests.forEach((req) => {
      departmentsMap.set(req.department.id, req.department.name);
      drugsMap.set(req.drug.id, req.drug.name);
    });

    const departmentIds = Array.from(departmentsMap.keys());
    const drugIds = Array.from(drugsMap.keys());

    const usage: Record<string, Record<string, number>> = {};
    for (const req of requests) {
      const deptId = String(req.department.id);
      const drugId = String(req.drug.id);

      if (!usage[deptId]) usage[deptId] = {};
      if (!usage[deptId][drugId]) usage[deptId][drugId] = 0;

      usage[deptId][drugId] += req.quantity;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Расходы ${day}.${month}.${year}`);

    // Заголовки
    const drugNames = drugIds.map((id) => drugsMap.get(id));
    const headerRow = sheet.addRow(['Отделение', ...drugNames]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Тело таблицы
    for (const deptId of departmentIds) {
      const deptName = departmentsMap.get(deptId);
      const row = [deptName];

      for (const drugId of drugIds) {
        // @ts-ignore
        row.push(usage[deptId]?.[drugId] || 0);
      }

      const newRow = sheet.addRow(row);
      newRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    // ✅ Общая строка "Общий расход"
    const totalRow = ['Общий расход'];

    for (const drugId of drugIds) {
      let total = 0;
      for (const deptId of departmentIds) {
        total += usage[deptId]?.[drugId] || 0;
      }
      // @ts-ignore
      totalRow.push(total);
    }

    const summaryRow = sheet.addRow(totalRow);
    summaryRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2EFDA' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Автоширина колонок
    sheet.columns.forEach((column) => {
      let maxLength = 10;
      // @ts-ignore
      column.eachCell({ includeEmpty: true }, (cell) => {
        const text = cell.value?.toString() || '';
        maxLength = Math.max(maxLength, text.length + 2);
      });
      column.width = maxLength;
    });

    const reportsDir = path.resolve(__dirname, '..', '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(
      reportsDir,
      `daily-report-${year}-${month}-${day}.xlsx`,
    );
    await workbook.xlsx.writeFile(filePath);
    await this.telegramService.sendFile(
      filePath,
      `Расход по отделениям за ${day}.${month}.${year}.xlsx`,
    );
  }
}
