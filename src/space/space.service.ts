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

  // 모든 space 읽기
  readAllSpace(): Promise<Space[]> {
    return this.spaceRepository.find({
      where: { removed: false },
    });
  }

  // id로 특정 space 찾기
  findSpaceById(id: number): Promise<Space> {
    return this.spaceRepository.findOne({
      where: { space_id: id },
    });
  }

  // id로 특정 spaceRole 찾기
  findSpaceRoleById(id: number): Promise<SpaceRole> {
    return this.spaceRoleRepository.findOne({
      where: { role_id: id },
    });
  }

  // space 개설
  async createSpace(
    @Body() body,
    @Req() req,
    logo: Express.Multer.File,
  ): Promise<Space> {
    const space = new Space();
    space.name = body.name;
    space.admin_code = body.admin_code;
    space.user_code = body.user_code;
    if (logo) space.logo = logo.filename;
    else space.logo = null;
    space.admin = req.user.user_id;

    const createSpace = await this.spaceRepository.save(space);
    // space 개설 성공 후 개설자 spaceRole 에 등록
    const spaceRole = new SpaceRole();
    spaceRole.space_id = space.space_id;
    spaceRole.role_name = '개설자';
    spaceRole.authority = true;
    const admin_role = await this.spaceRoleRepository.save(spaceRole);

    // 개설자 participation 에 추가
    const participation = new Participation();
    participation.space_id = space.space_id;
    participation.user_id = req.user.user_id;
    participation.role = admin_role.role_id;
    await this.participationRepository.save(participation);

    // spaceRole 등록
    for (const role of body.space_role) {
      const spaceRole = new SpaceRole();
      spaceRole.space_id = space.space_id;
      spaceRole.role_name = role.role_name;
      spaceRole.authority = role.authority === '관리자';
      await this.spaceRoleRepository.save(spaceRole);
    }

    return createSpace;
  }

  // space 삭제
  async deleteSpace(@Req() req, space_id: string): Promise<Space> {
    const space = await this.findSpaceById(Number(space_id));
    if (space) {
      // 개설자인지 판별
      if (req.user.user_id === space.admin) {
        space.removed = true;
        return await this.spaceRepository.save(space);
      } else {
        // 개설자가 아니면 삭제 불가
        throw new ForbiddenException();
      }
    } else {
      // 없는 space 삭제 시도
      throw new BadRequestException();
    }
  }

  // space 참여
  async participate(
    @Body() body,
    @Req() req,
    space_id: string,
  ): Promise<Participation> {
    const participation = new Participation();
    participation.user_id = req.user.user_id;
    participation.space_id = Number(space_id);

    // 입장 코드 및 권한에 따른 역할 판별
    const code = body.code;
    const space = await this.findSpaceById(Number(space_id));
    const spaceRole = await this.spaceRoleRepository.findOne({
      where: {
        space_id: Number(space_id),
        role_name: body.role_name,
      },
    });

    if (space && spaceRole) {
      if (
        // 입장 코드와 참여하려는 역할 권한 비교
        (code === space.admin_code && spaceRole.authority === true) ||
        (code === space.user_code && spaceRole.authority === false)
      ) {
        participation.role = spaceRole.role_id;
      } else throw new BadRequestException();
    } else throw new BadRequestException(); // 없는 space 참여 시도거나 없는 spaceRole 로 참여 시도

    return await this.participationRepository.save(participation);
  }

  // spaceRole 삭제
  async deleteSpaceRole(@Req() req, role_id: string): Promise<SpaceRole> {
    const deleteSpaceRole = await this.findSpaceRoleById(Number(role_id));

    if (deleteSpaceRole) {
      const participation = await this.participationRepository.findOne({
        where: {
          user_id: req.user.user_id,
          space_id: deleteSpaceRole.space_id,
        },
      });

      // 요청한 사용자가 가진 spaceRole 이 관리자인지 확인 후 삭제
      const spaceRole = await this.findSpaceRoleById(participation.role);
      if (spaceRole.authority) {
        deleteSpaceRole.removed = true;
        return await this.spaceRoleRepository.save(deleteSpaceRole);
      } else {
        // 관리자가 아니면 spaceRole 삭제 불가
        throw new ForbiddenException();
      }
    } else {
      // 없는 spaceRole 삭제 시도
      throw new BadRequestException();
    }
  }
}
