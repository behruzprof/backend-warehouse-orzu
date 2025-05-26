import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugRequest } from './entities/drug-request.entity';
import {
  CreateDrugRequestDto,
  DrugRequestStatus,
} from './dto/create-drug-request.dto';
import { UpdateDrugRequestDto } from './dto/update-drug-request.dto';
import { Drug } from 'drug/entities/drug.entity';
import { Department } from 'department/entities/department.entity';

@Injectable()
export class DrugRequestService {
  constructor(
    @InjectRepository(DrugRequest)
    private drugRequestRepo: Repository<DrugRequest>,

    @InjectRepository(Drug)
    private drugRepo: Repository<Drug>,

    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {}

  async create(createDto: CreateDrugRequestDto): Promise<DrugRequest> {
    const {
      departmentId,
      drugId,
      quantity,
      status = DrugRequestStatus.ISSUED,
      patientName,
    } = createDto;

    const department = await this.departmentRepo.findOneBy({
      id: departmentId,
    });
    if (!department) throw new NotFoundException('Bo‘lim topilmadi');

    const drug = await this.drugRepo.findOneBy({ id: drugId });
    if (!drug) throw new NotFoundException('Dori topilmadi');

    // Omborda dori miqdori yetarliligini tekshirish
    if (status === DrugRequestStatus.ISSUED && drug.quantity < quantity) {
      throw new BadRequestException(
        `Omborda yetarli miqdorda ${drug.name} mavjud emas`,
      );
    }

    // Ombordagi dorilar miqdorini yangilash
    if (status === DrugRequestStatus.ISSUED) {
      drug.quantity -= quantity;
    } else if (status === DrugRequestStatus.RETURNED) {
      drug.quantity += quantity;
    }

    await this.drugRepo.save(drug);

    const drugRequest = this.drugRequestRepo.create({
      department,
      drug,
      quantity,
      status,
      patientName,
    });

    return this.drugRequestRepo.save(drugRequest);
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

  async update(
    id: number,
    updateDto: UpdateDrugRequestDto,
  ): Promise<DrugRequest> {
    const drugRequest = await this.drugRequestRepo.findOne({
      where: { id },
      relations: ['drug'],
    });
    if (!drugRequest) throw new NotFoundException('Drug request not found');

    // Если меняется количество или статус — надо скорректировать остаток лекарства
    if (updateDto.quantity !== undefined || updateDto.status !== undefined) {
      // Возврат количества в старом статусе
      if (drugRequest.status === DrugRequestStatus.ISSUED) {
        drugRequest.drug.quantity += drugRequest.quantity;
      } else if (drugRequest.status === DrugRequestStatus.RETURNED) {
        drugRequest.drug.quantity -= drugRequest.quantity;
      }

      // Применяем новый статус и количество
      const newQuantity = updateDto.quantity ?? drugRequest.quantity;
      const newStatus = updateDto.status ?? drugRequest.status;

      if (
        newStatus === DrugRequestStatus.ISSUED &&
        drugRequest.drug.quantity < newQuantity
      ) {
        throw new BadRequestException(
          'Not enough drug quantity available for update',
        );
      }

      if (newStatus === DrugRequestStatus.ISSUED) {
        drugRequest.drug.quantity -= newQuantity;
      } else if (newStatus === DrugRequestStatus.RETURNED) {
        drugRequest.drug.quantity += newQuantity;
      }

      await this.drugRepo.save(drugRequest.drug);

      drugRequest.quantity = newQuantity;
      drugRequest.status = newStatus;
    }

    // Можно обновить остальные поля по аналогии
    if (updateDto.patientName !== undefined) {
      drugRequest.patientName = updateDto.patientName;
    }

    // И другие поля, если есть

    return this.drugRequestRepo.save(drugRequest);
  }

  async remove(id: number): Promise<void> {
    const drugRequest = await this.drugRequestRepo.findOne({
      where: { id },
      relations: ['drug'],
    });
    if (!drugRequest) throw new NotFoundException('Drug request not found');

    // При удалении заявки возвращаем количество лекарства обратно, если было выдано
    if (drugRequest.status === DrugRequestStatus.ISSUED) {
      drugRequest.drug.quantity += drugRequest.quantity;
      await this.drugRepo.save(drugRequest.drug);
    } else if (drugRequest.status === DrugRequestStatus.RETURNED) {
      drugRequest.drug.quantity -= drugRequest.quantity;
      await this.drugRepo.save(drugRequest.drug);
    }

    await this.drugRequestRepo.delete(id);
  }

  // Отчёты — например, сколько выдано по отделениям
  async getReportByDepartment() {
    return this.drugRequestRepo
      .createQueryBuilder('request')
      .select(`DATE(CONVERT_TZ(request.createdAt, '+00:00', '+05:00'))`, 'date')
      .addSelect('request.departmentId', 'departmentId')
      .addSelect('SUM(request.quantity)', 'totalQuantity')
      .where('request.status = :status', { status: DrugRequestStatus.ISSUED })
      .groupBy(`DATE(CONVERT_TZ(request.createdAt, '+00:00', '+05:00'))`)
      .addGroupBy('request.departmentId')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getReportByDrug() {
    const query = this.drugRequestRepo
      .createQueryBuilder('request')
      .select('request.drugId', 'drugId')
      .addSelect('SUM(request.quantity)', 'totalQuantity')
      .addSelect('request.status', 'status')
      .groupBy('request.drugId')
      .addGroupBy('request.status');

    return query.getRawMany();
  }

  async getReportByPatient() {
    const query = this.drugRequestRepo
      .createQueryBuilder('request')
      .select('request.patientName', 'patientName')
      .addSelect('SUM(request.quantity)', 'totalQuantity')
      .where('request.patientName IS NOT NULL')
      .andWhere('request.status = :status', {
        status: DrugRequestStatus.ISSUED,
      })
      .groupBy('request.patientName');

    return query.getRawMany();
  }
}
