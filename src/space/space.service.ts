import { BadRequestException, Body, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Space } from './space.entity';
import { Repository } from 'typeorm';
import { SpaceRole } from './spaceRole.entity';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space) private spaceRepository: Repository<Space>,
    @InjectRepository(SpaceRole)
    private spaceRoleRepository: Repository<SpaceRole>,
  ) {}

  findAll(): Promise<Space[]> {
    return this.spaceRepository.find();
  }

  async createSpace(@Body() body, @Req() req, logo: Express.Multer.File) {
    const space = new Space();
    space.name = body.name;
    space.admin_code = body.admin_code;
    space.user_code = body.user_code;
    if (logo) space.logo = logo.filename;
    else space.logo = null;
    space.admin = req.user.user_id;

    this.spaceRepository.save(space).then(async (space) => {
      console.log(space.space_id);
      for (const role of body.space_role) {
        const spaceRole = new SpaceRole();
        spaceRole.space_id = space.space_id;
        spaceRole.role_name = role.role_name;
        spaceRole.authority = role.authority === '관리자';
        await this.spaceRoleRepository.save(spaceRole);
      }
    });
  }
}
