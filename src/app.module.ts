import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DrugModule } from './drug/drug.module';
import { Drug } from 'drug/entities/drug.entity';
import { DrugArrivalModule } from './drug-arrival/drug-arrival.module';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { DrugRequestModule } from './drug-request/drug-request.module';
import { DepartmentModule } from './department/department.module';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { Department } from 'department/entities/department.entity';
import { TelegramService } from './telegram/telegram.service';
import { TelegramModule } from 'telegram/telegram.module';
import { DrugOrderModule } from './drug-order/drug-order.module';
import { ReportModule } from './report/report.module';
import { DraftOrderModule } from './draft-order/draft-order.module';
import { DraftOrder } from 'draft-order/entities/draft-order.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: 'mysql.railway.internal',
        port: 3306,
        username: 'root',
        password: 'MRTYBqIyYuTuPxzdnOSQTsUdXoYqPGft',
        database: 'railway',
        entities: [Drug, DrugArrival, DrugRequest, Department, DraftOrder],
        synchronize: true,
      }),
    }),
    DrugModule,
    DrugArrivalModule,
    DrugRequestModule,
    DepartmentModule,
    TelegramModule,
    DrugOrderModule,
    ReportModule,
    DraftOrderModule
  ],
  controllers: [],
  providers: [TelegramService],
})
export class AppModule {}

/* 

 useFactory: () => ({
        type: 'mysql',
        host: 'mysql.railway.internal',
        port: 3306,
        username: 'root',
        password: 'MRTYBqIyYuTuPxzdnOSQTsUdXoYqPGft',
        database: 'railway',
        entities: [Drug, DrugArrival, DrugRequest, Department, DraftOrder],
        synchronize: true,
      }),
*/
