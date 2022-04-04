import {
  Body,
  Controller,
  Get,
  Param,
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

  // space 삭제
  @Post('/delete/:space_id')
  deleteSpace(@Req() req, @Param('space_id') space_id: string): Promise<void> {
    return this.spaceService.deleteSpace(req, space_id);
  }

  @Post('/participate/:space_id')
  participate(@Body() body, @Req() req, @Param('space_id') space_id: string) {
    return this.spaceService.participate(body, req, space_id);
  }
}
