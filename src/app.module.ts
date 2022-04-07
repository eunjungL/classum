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
import { PostModule } from './post/post.module';
import { Post } from './post/post.entity';
import { PostController } from './post/post.controller';
import { Chat } from './post/chat.entity';
import { PostRead } from './post/postRead.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.production.env'
          : '.development.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'dldms',
      password: 'password',
      database: process.env.DATABASE,
      entities: [User, Space, SpaceRole, Participation, Post, Chat, PostRead],
      synchronize: false,
    }),
    UserModule,
    SpaceModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(AuthMiddleware)
      .exclude('/user/login', '/user/refresh')
      .forRoutes(UserController, SpaceController, PostController);
  }
}
