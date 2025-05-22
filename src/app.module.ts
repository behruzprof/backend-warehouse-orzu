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

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads'
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Drug, DrugArrival, DrugRequest, Department],
        synchronize: true
      })
    }),
    DrugModule,
    DrugArrivalModule,
    DrugRequestModule,
    DepartmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
