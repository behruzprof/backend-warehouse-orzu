// telegram.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class TelegramService {
  private readonly TOKEN = '8136238330:AAEtyUK32ANsZzICWdYDZA2qBoqYJa9InM0';
  private readonly CHAT_ID1_GULNOZA = '542403905';
  private readonly CHAT_ID1_DILNOZA = '1119825333';
  private readonly CHAT_ID1_BEHRUZ = '6049496733';

  async sendMessage(
    text: string,
    { isPrivate }: { isPrivate: boolean },
  ): Promise<void> {
    await axios.post(`https://api.telegram.org/bot${this.TOKEN}/sendMessage`, {
      chat_id: this.CHAT_ID1_GULNOZA,
      text,
      parse_mode: 'HTML',
    });
    if (!isPrivate) {
      await axios.post(
        `https://api.telegram.org/bot${this.TOKEN}/sendMessage`,
        {
          chat_id: this.CHAT_ID1_DILNOZA,
          text,
          parse_mode: 'HTML',
        },
      );
    }
  }

  async sendFile(filePath: string, fileName = 'file.xlsx'): Promise<void> {
    const form = new FormData();
    form.append('chat_id', this.CHAT_ID1_BEHRUZ);
    form.append('document', fs.createReadStream(filePath), fileName);

    await axios.post(
      `https://api.telegram.org/bot${this.TOKEN}/sendDocument`,
      form,
      {
        headers: form.getHeaders(),
      },
    );
  }
}
