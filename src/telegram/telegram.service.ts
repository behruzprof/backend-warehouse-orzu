// telegram.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private readonly TOKEN = '8136238330:AAEtyUK32ANsZzICWdYDZA2qBoqYJa9InM0';

  private readonly CHAT_ID1_GULNOZA = '542403905';
  private readonly CHAT_ID1_DILNOZA = '1119825333';
  private readonly CHAT_ID1_SHAXBOZ = '732458676';
  private readonly CHAT_ID1_BEHRUZ = '6049496733';
  private readonly CHAT_ID1_IRODA = '7164165961';

  // универсальная задержка (анти-бан)
  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // безопасная отправка одного сообщения
  private async sendMessageSafe(chat_id: string, text: string) {
    try {
      const res = await axios.post(
        `https://api.telegram.org/bot${this.TOKEN}/sendMessage`,
        {
          chat_id,
          text,
          parse_mode: 'HTML',
        },
      );

      return res.data;
    } catch (error) {
      this.logger.error(
        `Telegram error for chat_id ${chat_id}: ${error.response?.data?.description}`,
      );
    }
  }

  // основная отправка
  async sendMessage(text: string, { isPrivate }: { isPrivate: boolean }) {
    const targets = [this.CHAT_ID1_GULNOZA];

    if (!isPrivate) {
      targets.push(
        this.CHAT_ID1_DILNOZA,
        this.CHAT_ID1_SHAXBOZ,
        this.CHAT_ID1_BEHRUZ,
        this.CHAT_ID1_IRODA,
      );
    }

    // Отправка с очередью + задержкой 200мс
    for (const chatId of targets) {
      await this.sendMessageSafe(chatId, text);
      await this.sleep(200); // анти-спам Telegram
    }
  }

  // отправка документа
  async sendFile(filePath: string, fileName = 'file.xlsx'): Promise<void> {
    const form = new FormData();
    form.append('chat_id', this.CHAT_ID1_GULNOZA);
    form.append('document', fs.createReadStream(filePath), fileName);

    try {
      await axios.post(
        `https://api.telegram.org/bot${this.TOKEN}/sendDocument`,
        form,
        {
          headers: form.getHeaders(),
        },
      );
    } catch (error) {
      this.logger.error(
        `Telegram file send error: ${error.response?.data?.description}`,
      );
    }
  }
}
