import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugRequest } from './entities/drug-request.entity';
import { CreateDrugRequestDto } from './dto/create-drug-request.dto';
import { Drug } from 'drug/entities/drug.entity';
import { Department } from 'department/entities/department.entity';
import { TelegramService } from 'telegram/telegram.service';
import { TEMPLATE_COMPONENTS } from 'drug/template';

@Injectable()
export class DrugRequestService {
  constructor(
    private readonly telegramService: TelegramService,

    @InjectRepository(DrugRequest)
    private drugRequestRepo: Repository<DrugRequest>,

    @InjectRepository(Drug)
    private drugRepo: Repository<Drug>,

    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {}

  async create(createDtoList: CreateDrugRequestDto[]): Promise<DrugRequest[]> {
    const createdRequests: DrugRequest[] = [];
    const messages: string[] = [];

    for (const dto of createDtoList) {
      const { departmentId, drugId, quantity } = dto;

      const department = await this.departmentRepo.findOneBy({ id: departmentId });
      if (!department) throw new NotFoundException('Bo‘lim topilmadi');

      const requestedDrug = await this.drugRepo.findOneBy({ id: drugId as any });
      if (!requestedDrug) throw new NotFoundException('Dori topilmadi');

      const templateMap = TEMPLATE_COMPONENTS[String(drugId)];

      if (templateMap) {
        // ✅ ЛОГИКА ДЛЯ ШАБЛОНА
        const drugsToUpdate: Drug[] = [];

        for (const comp of templateMap) {
          const actualDrug = await this.drugRepo.findOneBy({ id: comp.id as any });
          if (!actualDrug) throw new NotFoundException(`Komponent topilmadi (ID: ${comp.id})`);

          const neededQty = comp.qty * quantity;
          if (actualDrug.quantity < neededQty) {
            throw new BadRequestException(
              `Omborda yetarli komponent "${actualDrug.name}" mavjud emas. (Kerak: ${neededQty}, Qolgan: ${actualDrug.quantity})`,
            );
          }
          
          actualDrug.quantity -= neededQty;
          drugsToUpdate.push(actualDrug);
        }

        await this.drugRepo.save(drugsToUpdate);

        let drugRequest = this.drugRequestRepo.create({
          department,
          drug: requestedDrug,
          quantity,
        });

        this.applyNightShiftTimeLogic(department.name, drugRequest);
        await this.drugRequestRepo.save(drugRequest);

        createdRequests.push(drugRequest);
        messages.push(`💊 To'plam: ${requestedDrug.name}\n 🔢 Miqdor: ${quantity}`);
      } else {
        // ❌ ЛОГИКА ДЛЯ ОБЫЧНОГО ЛЕКАРСТВА
        if (requestedDrug.quantity < quantity) {
          throw new BadRequestException(`Omborda yetarli ${requestedDrug.name} mavjud emas`);
        }

        requestedDrug.quantity -= quantity;
        await this.drugRepo.save(requestedDrug);

        let drugRequest = this.drugRequestRepo.create({
          department,
          drug: requestedDrug,
          quantity,
        });

        this.applyNightShiftTimeLogic(department.name, drugRequest);
        await this.drugRequestRepo.save(drugRequest);

        createdRequests.push(drugRequest);
        messages.push(`💊 Dori: ${requestedDrug.name}\n 🔢Miqdor: ${quantity}\n📦 Qolgan: ${requestedDrug.quantity}`);
      }
    }

    if (messages.length) {
      await this.telegramService.sendMessage(
        `🟢 [🆕 Talabnomalar yaratildi]\n🏥Bo‘lim: ${createdRequests[0].department.name}\n\n${messages.join('\n\n')}`,
        { isPrivate: false },
      );
    }

    return createdRequests;
  }

  async update(id: number, updateDto: Partial<CreateDrugRequestDto>): Promise<DrugRequest> {
    const existingRequest = await this.drugRequestRepo.findOne({
      where: { id },
      relations: ['drug', 'department'],
    });

    if (!existingRequest) {
      throw new NotFoundException('Talabnoma topilmadi');
    }

    const originalQuantity = existingRequest.quantity;
    const oldDrugId = existingRequest.drug.id;

    if (updateDto.departmentId && updateDto.departmentId !== existingRequest.department.id) {
      const newDepartment = await this.departmentRepo.findOneBy({ id: updateDto.departmentId });
      if (!newDepartment) throw new NotFoundException('Yangi bo‘lim topilmadi');
      existingRequest.department = newDepartment;
    }

    const newDrugId = updateDto.drugId ?? oldDrugId;
    const newQty = updateDto.quantity ?? originalQuantity;

    if (newDrugId !== oldDrugId || newQty !== originalQuantity) {
      
      // 1. ВОЗВРАТ СТАРОГО
      const oldTemplateMap = TEMPLATE_COMPONENTS[String(oldDrugId)];
      if (oldTemplateMap) {
        for (const comp of oldTemplateMap) {
          const actualDrug = await this.drugRepo.findOneBy({ id: comp.id as any });
          if (actualDrug) {
            actualDrug.quantity += comp.qty * originalQuantity;
            await this.drugRepo.save(actualDrug);
          }
        }
      } else {
        existingRequest.drug.quantity += originalQuantity;
        await this.drugRepo.save(existingRequest.drug);
      }

      // 2. СПИСАНИЕ НОВОГО
      const newDrug = await this.drugRepo.findOneBy({ id: newDrugId as any });
      if (!newDrug) throw new NotFoundException('Yangi dori topilmadi');

      const newTemplateMap = TEMPLATE_COMPONENTS[String(newDrugId)];
      if (newTemplateMap) {
        for (const comp of newTemplateMap) {
          const actualDrug = await this.drugRepo.findOneBy({ id: comp.id as any });
          if (!actualDrug) throw new NotFoundException(`Komponent topilmadi (ID: ${comp.id})`);

          const neededQty = comp.qty * newQty;
          if (actualDrug.quantity < neededQty) {
             throw new BadRequestException(`Omborda yetarli komponent "${actualDrug.name}" mavjud emas`);
          }
          actualDrug.quantity -= neededQty;
          await this.drugRepo.save(actualDrug);
        }
      } else {
        if (newDrug.quantity < newQty) {
          throw new BadRequestException(`Omborda yetarli ${newDrug.name} mavjud emas`);
        }
        newDrug.quantity -= newQty;
        await this.drugRepo.save(newDrug);
      }

      existingRequest.drug = newDrug;
      existingRequest.quantity = newQty;
    }

    const updated = await this.drugRequestRepo.save(existingRequest);

    await this.telegramService.sendMessage(
      `🟡 [✏️ Talabnoma yangilandi]\n💊 Dori/To'plam: ${updated.drug.name}\n🏥 Bo‘lim: ${updated.department.name}\n✏️ Miqdor: ${updated.quantity}`,
      { isPrivate: true },
    );

    return updated;
  }

  findAll(): Promise<DrugRequest[]> {
    return this.drugRequestRepo.find({ relations: ['department', 'drug'] });
  }

  findOne(id: number): Promise<DrugRequest | null> {
    return this.drugRequestRepo.findOne({
      where: { id },
      relations: ['department', 'drug'],
    });
  }

  async remove(id: number): Promise<void> {
    const drugRequest = await this.drugRequestRepo.findOne({
      where: { id },
      relations: ['drug', 'department'],
    });

    if (!drugRequest) throw new NotFoundException('Talabnoma topilmadi');

    const templateMap = TEMPLATE_COMPONENTS[String(drugRequest.drug.id)];
    if (templateMap) {
      for (const comp of templateMap) {
        const actualDrug = await this.drugRepo.findOneBy({ id: comp.id as any });
        if (actualDrug) {
          actualDrug.quantity += comp.qty * drugRequest.quantity;
          await this.drugRepo.save(actualDrug);
        }
      }
    } else {
      drugRequest.drug.quantity += drugRequest.quantity;
      await this.drugRepo.save(drugRequest.drug);
    }
    
    await this.drugRequestRepo.delete(id);

    await this.telegramService.sendMessage(
      `🔴 [❌ Talabnoma o‘chirildi]\n💊 Dori/To'plam: ${drugRequest.drug.name}\n🏥 Bo‘lim: ${drugRequest.department.name}\n🗑 Miqdor: ${drugRequest.quantity}`,
      { isPrivate: true },
    );
  }

  // --- Helpers ---
  private applyNightShiftTimeLogic(departmentName: string, drugRequest: DrugRequest) {
    const nightShifts = [
      'НОЧ_МУОЛАЖА_ШАХБОЗ', 'НОЧ_МУОЛАЖА_ШОХСАНАМ', 'НОЧ_МУОЛАЖА_БУНЁД',
      'НОЧ_МУОЛАЖА_НАРГИЗА', 'НОЧ_МУОЛАЖА_АКМАРАЛ', 'НОЧ_МУОЛАЖА_ЖАНАР',
      'НОЧ_МУОЛАЖА_САБОХАТ', 'НОЧ_МУОЛАЖА_FERUZA'
    ];

    if (nightShifts.includes(departmentName)) {
      const now = new Date();
      const localTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
      const hour = localTime.getHours();

      if (hour >= 0 && hour < 11) {
        const adjustedDate = new Date(localTime);
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        adjustedDate.setHours(0, 0, 0, 0);
        drugRequest.createdAt = adjustedDate;
      }
    }
  }

  // --- Reports ---
  async getReportByDepartment() {
    return this.drugRequestRepo
      .createQueryBuilder('request')
      .select(`DATE(CONVERT_TZ(request.createdAt, '+00:00', '+05:00'))`, 'date')
      .addSelect('request.departmentId', 'departmentId')
      .addSelect('SUM(request.quantity)', 'totalQuantity')
      .groupBy(`DATE(CONVERT_TZ(request.createdAt, '+00:00', '+05:00'))`)
      .addGroupBy('request.departmentId')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getReportByDrug(drugId: string | number) {
    return this.drugRequestRepo
      .createQueryBuilder('request')
      .select('d.name', 'department')
      .addSelect("DATE_FORMAT(request.createdAt, '%Y-%m')", 'month')
      .addSelect('SUM(request.quantity)', 'totalQuantity')
      .innerJoin('request.department', 'd')
      .where('request.drugId = :drugId', { drugId })
      .groupBy('d.name')
      .addGroupBy("DATE_FORMAT(request.createdAt, '%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getReportByPatient() {
    return this.drugRequestRepo
      .createQueryBuilder('request')
      .select('request.patientName', 'patientName')
      .addSelect('SUM(request.quantity)', 'totalQuantity')
      .where('request.patientName IS NOT NULL')
      .groupBy('request.patientName')
      .getRawMany();
  }
}