import { Body, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Space } from './space.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space) private spaceRepository: Repository<Space>,
  ) {}

  findAll(): Promise<Space[]> {
    return this.spaceRepository.find();
  }

  async createSpace(@Body() body, @Req() req, logo: Express.Multer.File) {
    const space = new Space();
    space.name = body.name;
    space.admin_code = body.admin_code;
    space.user_code = body.user_code;
    space.logo = logo.originalname;
    space.admin = req.user.email;
    await this.spaceRepository.save(space);
  }
}
