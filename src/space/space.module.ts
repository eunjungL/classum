import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './space.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SpaceRole } from './spaceRole.entity';
import { Participation } from './participation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Space, SpaceRole, Participation]),
    MulterModule.register({
      storage: diskStorage({
        destination: './src/upload/logo',
        filename: (req, file, cb) => {
          // 현재 시간(초) + 원래 이름으로 파일 저장
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  ],
  controllers: [SpaceController],
  providers: [SpaceService],
})
export class SpaceModule {}
