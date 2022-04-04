import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Space} from "./space.entity";
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Space]),
    MulterModule.register({
      storage: diskStorage({
        destination: './src/upload/logo',
        filename: (req, file, cb) => {
          cb(null, Date.now() + "-" + file.originalname);
        }
      })
    })
  ],
  controllers: [SpaceController],
  providers: [SpaceService]
})
export class SpaceModule {}
