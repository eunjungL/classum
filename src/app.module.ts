import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'dldms',
        password: 'password',
        database: 'classum_dev',
        entities: [],
        synchronize: false
      }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
