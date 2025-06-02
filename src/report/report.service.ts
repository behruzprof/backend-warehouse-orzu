import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { Drug } from 'drug/entities/drug.entity';
import { TelegramService } from 'telegram/telegram.service';
import { Repository } from 'typeorm';

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

  create() {
    this.telegramService.sendFile('file path', 'file name');
  }
}
