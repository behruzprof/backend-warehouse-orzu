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
  ) { }

  async create(createDtoList: CreateDrugRequestDto[]): Promise<DrugRequest[]> {
    const createdRequests: DrugRequest[] = [];
    const messages: string[] = [];

    for (const dto of createDtoList) {
      const { departmentId, drugId, quantity } = dto;

      const department = await this.departmentRepo.findOneBy({
        id: departmentId,
      });
      if (!department) throw new NotFoundException('Bo‘lim topilmadi');

      const drug = await this.drugRepo.findOneBy({ id: drugId });
      if (!drug) throw new NotFoundException('Dori topilmadi');

      if (drug.quantity < quantity) {
        throw new BadRequestException(
          `Omborda yetarli ${drug.name} mavjud emas`,
        );
      }

      drug.quantity -= quantity;
      await this.drugRepo.save(drug);

      let drugRequest =
        this.drugRequestRepo.create({
          department,
          drug,
          quantity,
        });

      if (department.name === "НОЧ_МУОЛАЖА_ШАХБОЗ" || 
        department.name === "НОЧ_МУОЛАЖА_ШОХСАНАМ" ||
        department.name === "НОЧ_МУОЛАЖА_БУНЁД" ||
        department.name === "НОЧ_МУОЛАЖА_НАРГИЗА" ||
        department.name === "НОЧ_МУОЛАЖА_АКМАРАЛ" ||
        department.name === "НОЧ_МУОЛАЖА_ЖАНАР" ||
        department.name === "НОЧ_МУОЛАЖА_САБОХАТ" ||
        department.name === "НОЧ_МУОЛАЖА_FERUZA" ||

      ) {
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

      await this.drugRequestRepo.save(drugRequest);

      createdRequests.push(drugRequest);
      messages.push(
        `💊 Dori: ${drug.name}\n 🔢Miqdor: ${quantity}\n📦 Qolgan: ${drug.quantity}`,
      );
    }

    if (messages.length) {
      await this.telegramService.sendMessage(
        `🟢 [🆕 Talabnomalar yaratildi]\n🏥Bo‘lim: ${createdRequests[0].department.name}\n\n${messages.join('\n\n')}`,
        { isPrivate: false },
      );
    }

    return createdRequests;
  }

  async update(
    id: number,
    updateDto: Partial<CreateDrugRequestDto>,
  ): Promise<DrugRequest> {
    const existingRequest = await this.drugRequestRepo.findOne({
      where: { id },
      relations: ['drug', 'department'],
    });

    if (!existingRequest) {
      throw new NotFoundException('Talabnoma topilmadi');
    }

    const originalQuantity = existingRequest.quantity;

    // Обновление department
    if (
      updateDto.departmentId &&
      updateDto.departmentId !== existingRequest.department.id
    ) {
      const newDepartment = await this.departmentRepo.findOneBy({
        id: updateDto.departmentId,
      });
      if (!newDepartment) throw new NotFoundException('Yangi bo‘lim topilmadi');
      existingRequest.department = newDepartment;
    }

    // Обновление drug
    if (updateDto.drugId && updateDto.drugId !== existingRequest.drug.id) {
      const newDrug = await this.drugRepo.findOneBy({ id: updateDto.drugId });
      if (!newDrug) throw new NotFoundException('Yangi dori topilmadi');

      // Вернуть количество старому препарату
      existingRequest.drug.quantity += originalQuantity;
      await this.drugRepo.save(existingRequest.drug);

      // Снять с нового препарата
      if (newDrug.quantity < (updateDto.quantity ?? originalQuantity)) {
        throw new BadRequestException(
          `Omborda yetarli ${newDrug.name} mavjud emas`,
        );
      }

      newDrug.quantity -= updateDto.quantity ?? originalQuantity;
      await this.drugRepo.save(newDrug);

      existingRequest.drug = newDrug;
      existingRequest.quantity = updateDto.quantity ?? originalQuantity;
    } else if (
      updateDto.quantity !== undefined &&
      updateDto.quantity !== originalQuantity
    ) {
      const delta = updateDto.quantity - originalQuantity;

      if (existingRequest.drug.quantity < delta) {
        throw new BadRequestException(
          `Omborda yetarli ${existingRequest.drug.name} mavjud emas`,
        );
      }

      existingRequest.drug.quantity -= delta;
      await this.drugRepo.save(existingRequest.drug);

      existingRequest.quantity = updateDto.quantity;
    }

    const updated = await this.drugRequestRepo.save(existingRequest);

    await this.telegramService.sendMessage(
      `🟡 [✏️ Talabnoma yangilandi]\n💊 Dori: ${updated.drug.name}\n🏥 Bo‘lim: ${updated.department.name}\n✏️ Miqdor: ${updated.quantity}\n📦 Qolgan: ${updated.drug.quantity}`,
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

    drugRequest.drug.quantity += drugRequest.quantity;
    await this.drugRepo.save(drugRequest.drug);
    await this.drugRequestRepo.delete(id);

    await this.telegramService.sendMessage(
      `🔴 [❌ Talabnoma o‘chirildi]\n💊 Dori: ${drugRequest.drug.name}\n🏥 Bo‘lim: ${drugRequest.department.name}\n🗑 Miqdor: ${drugRequest.quantity}\n📦 Qolgan: ${drugRequest.drug.quantity}`,
      { isPrivate: true },
    );
  }

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

  async getReportByDrug(drugId: number) {
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
