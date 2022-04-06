import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Participation } from '../space/participation.entity';
import { SpaceService } from '../space/space.service';
import { Space } from '../space/space.entity';
import { SpaceRole } from '../space/spaceRole.entity';
import { Chat } from './chat.entity';
import { PostRead } from './postRead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Participation, SpaceRole, Chat, PostRead]),
    MulterModule.register({
      storage: diskStorage({
        destination: './src/upload/post',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
