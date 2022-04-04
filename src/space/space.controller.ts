import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { Space } from './space.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('space')
export class SpaceController {
  constructor(private spaceService: SpaceService) {}

  @Get()
  findAll(): Promise<Space[]> {
    return this.spaceService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  createSpace(
    @Body() body,
    @Req() req,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    return this.spaceService.createSpace(body, req, logo);
  }
}
