import {
  BadRequestException,
  Body,
  ForbiddenException,
  Injectable,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Space } from './space.entity';
import { Repository } from 'typeorm';
import { SpaceRole } from './spaceRole.entity';
import { Participation } from './participation.entity';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space) private spaceRepository: Repository<Space>,
    @InjectRepository(SpaceRole)
    private spaceRoleRepository: Repository<SpaceRole>,
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
  ) {}

  findAll(): Promise<Space[]> {
    return this.spaceRepository.find();
  }

  findSpaceById(id: number): Promise<Space> {
    return this.spaceRepository.findOne({
      where: { space_id: id },
    });
  }

  // space 개설
  async createSpace(@Body() body, @Req() req, logo: Express.Multer.File) {
    const space = new Space();
    space.name = body.name;
    space.admin_code = body.admin_code;
    space.user_code = body.user_code;
    if (logo) space.logo = logo.filename;
    else space.logo = null;
    space.admin = req.user.user_id;

    this.spaceRepository.save(space).then(async (space) => {
      // space 개설 성공 후 spaceRole 등록
      for (const role of body.space_role) {
        const spaceRole = new SpaceRole();
        spaceRole.space_id = space.space_id;
        spaceRole.role_name = role.role_name;
        spaceRole.authority = role.authority === '관리자';
        await this.spaceRoleRepository.save(spaceRole);
      }
    });
  }

  // space 삭제
  async deleteSpace(@Req() req, space_id: string): Promise<void> {
    const space = await this.findSpaceById(Number(space_id));
    if (space) {
      // 개설자인지 판별
      if (req.user.user_id === space.admin) {
        space.removed = true;
        await this.spaceRepository.save(space);
      } else {
        throw new ForbiddenException();
      }
    } else {
      // 없는 space 삭제 시도
      throw new BadRequestException();
    }
  }

  // space 참여
  async participate(@Body() body, @Req() req, space_id: string) {
    const participation = new Participation();
    participation.user_id = req.user.user_id;
    participation.space_id = Number(space_id);

    // 입장 코드 및 권한에 따른 역할 판별
    const code = body.code;
    const space = await this.findSpaceById(Number(space_id));
    const space_role = await this.spaceRoleRepository.findOne({
      where: {
        space_id: Number(space_id),
        role_name: body.role_name,
      },
    });
    if (space && space_role) {
      if (
        (code === space.admin_code && space_role.authority === true) ||
        (code === space.user_code && space_role.authority === false)
      ) {
        participation.role = space_role.role_id;
      } else throw new BadRequestException();
    } else throw new BadRequestException();

    console.log(participation);
    await this.participationRepository.save(participation);
  }
}
