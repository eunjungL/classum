import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { AuthMiddleware } from './auth.middleware';
import { UserController } from './user/user.controller';
import { SpaceModule } from './space/space.module';
import { Space } from './space/space.entity';
import { SpaceController } from './space/space.controller';
import { SpaceRole } from './space/spaceRole.entity';
import { Participation } from './space/participation.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'dldms',
      password: 'password',
      database: 'classum_dev',
      entities: [User, Space, SpaceRole, Participation],
      synchronize: false,
    }),
    UserModule,
    SpaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(AuthMiddleware)
      .exclude('/user/login', '/user/refresh')
      .forRoutes(UserController, SpaceController);
  }
}
