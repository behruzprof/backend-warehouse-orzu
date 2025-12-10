// drug-order.service.ts
import { Injectable } from '@nestjs/common';
import { CreateDrugOrderDto } from './dto/create-drug-order.dto';
import { TelegramService } from 'telegram/telegram.service';
import * as ExcelJS from 'exceljs';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class DrugOrderService {
  constructor(private readonly telegramService: TelegramService) {}

  async create(orders: CreateDrugOrderDto[]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Drug Orders');

    // Устанавливаем заголовки столбцов с форматами
    sheet.columns = [
      { header: 'Название', key: 'name', width: 30 },
      { header: 'Количество', key: 'amount', width: 15 },
      { header: 'Единица', key: 'unit', width: 15 },
      { header: 'Категория', key: 'category', width: 25 },
      { header: 'Аптека', key: 'pharmacy', width: 25 }, // фикс: pharmacy
    ];

    // Стили для заголовка
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    for (const order of orders) {
      const row = sheet.addRow({
        ...order,
        pharmacy: 'Zangiota OrzuMedical',
      });

      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 12, bold: false };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    // Добавим стиль заголовков отдельно
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { name: 'Arial', size: 13, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }, // светло-серый
      };
    });

    const filename = `drug-order-${randomUUID()}.xlsx`;
    const tempDir = join(__dirname, '../../../temp');

    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const filepath = join(tempDir, filename);

    await workbook.xlsx.writeFile(filepath);
    await this.telegramService.sendFile(
      filepath,
      'Новый заказ лекарств 📦.xlsx',
    );
    unlinkSync(filepath);

    return { success: true };
  }
}
