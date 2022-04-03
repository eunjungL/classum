import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from "./user/user.entity";

@Module({
  imports: [
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'dldms',
        password: 'password',
        database: 'classum_dev',
        entities: [User],
        synchronize: false
      }),
      UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
