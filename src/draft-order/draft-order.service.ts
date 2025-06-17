import { DrugOrderService } from './../drug-order/drug-order.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DraftOrder } from './entities/draft-order.entity';
import { Drug } from 'drug/entities/drug.entity';
import { CreateDraftOrderDto } from './dto/create-draft-order.dto';
import { CreateDrugOrderDto } from 'drug-order/dto/create-drug-order.dto';

@Injectable()
export class DraftOrderService {
  constructor(
    @InjectRepository(DraftOrder)
    private draftOrderRepository: Repository<DraftOrder>,

    @InjectRepository(Drug)
    private drugRepository: Repository<Drug>,

    private drugOrderService: DrugOrderService,
  ) {}

  async create(dto: CreateDraftOrderDto): Promise<DraftOrder> {
    const drug = await this.drugRepository.findOne({
      where: { id: dto.drugId },
    });

    if (!drug) {
      throw new NotFoundException(`Лекарство с ID ${dto.drugId} не найдено`);
    }

    const existingDraft = await this.draftOrderRepository.findOne({
      where: { drugId: dto.drugId },
    });

    if (existingDraft) {
      existingDraft.quantity = dto.quantity;
      existingDraft.unit = dto.unit;
      return this.draftOrderRepository.save(existingDraft);
    }

    const draft = this.draftOrderRepository.create({
      drugId: dto.drugId,
      quantity: dto.quantity,
      unit: dto.unit,
      category: drug.category,
      name: drug.name,
    });

    return this.draftOrderRepository.save(draft);
  }
  async ensureDrugExists(): Promise<void> {
    const drafts = await this.draftOrderRepository.find();

    if (!drafts.length) {
      throw new NotFoundException('Нет черновиков для синхронизации лекарств');
    }

    const uniqueDraftsMap = new Map<string, CreateDrugOrderDto>();

    for (const draft of drafts) {
      if (!uniqueDraftsMap.has(draft.name)) {
        uniqueDraftsMap.set(draft.name, {
          name: draft.name,
          amount: draft.quantity,
          unit: draft.unit,
          category: draft.category,
        });
      }
    }

    const uniqueDrugs = Array.from(uniqueDraftsMap.values());

    if (!uniqueDrugs.length) {
      throw new BadRequestException('Нет уникальных лекарств для создания');
    }

    try {
      await this.drugOrderService.create(uniqueDrugs);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при создании заказа: ' + (error.message || ''),
      );
    }
  }

  async findAll(): Promise<DraftOrder[]> {
    return this.draftOrderRepository.find();
  }

  async removeById(id: string) {
    const result = await this.draftOrderRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Черновик не найден');
    }
    return { message: 'Черновик удалён' };
  }

  async removeAll() {
    await this.draftOrderRepository.clear();
    return { message: 'Все черновики удалены' };
  }
}
