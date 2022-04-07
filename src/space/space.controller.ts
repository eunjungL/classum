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
import { Participation } from './participation.entity';
import { SpaceRole } from './spaceRole.entity';

@Controller('space')
export class SpaceController {
  constructor(private spaceService: SpaceService) {}

  // 모든 space 읽기
  @Get()
  readAllSpace(): Promise<Space[]> {
    return this.spaceService.readAllSpace();
  }

  // space 등록
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  createSpace(
    @Body() body,
    @Req() req,
    @UploadedFile() logo: Express.Multer.File,
  ): Promise<Space> {
    return this.spaceService.createSpace(body, req, logo);
  }

  // space 삭제
  @Post('/delete/:space_id')
  deleteSpace(@Req() req, @Param('space_id') space_id: string): Promise<Space> {
    return this.spaceService.deleteSpace(req, space_id);
  }

  // spaceRole 삭제
  @Post('/deleteRole/:role_id')
  deleteRole(
    @Req() req,
    @Param('role_id') role_id: string,
  ): Promise<SpaceRole> {
    return this.spaceService.deleteSpaceRole(req, role_id);
  }

  // space 참여
  @Post('/participate/:space_id')
  participate(
    @Body() body,
    @Req() req,
    @Param('space_id') space_id: string,
  ): Promise<Participation> {
    return this.spaceService.participate(body, req, space_id);
  }
}
