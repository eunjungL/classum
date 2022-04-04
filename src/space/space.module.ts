import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Space} from "./space.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Space])],
  controllers: [SpaceController],
  providers: [SpaceService]
})
export class SpaceModule {}
