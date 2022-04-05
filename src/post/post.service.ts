import { Body, ForbiddenException, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';
import { SpaceService } from '../space/space.service';
import { Participation } from '../space/participation.entity';
import { SpaceRole } from '../space/spaceRole.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(SpaceRole)
    private spaceRoleRepository: Repository<SpaceRole>,
  ) {}

  // Post 등록
  async createPost(
    @Body() body,
    @Req() req,
    space_id: number,
    file: Express.Multer.File,
  ): Promise<Post> {
    const participation = await this.participationRepository.findOne({
      where: {
        user_id: req.user.user_id,
        space_id: space_id,
      },
    });

    const post = new Post();
    post.title = body.title;
    post.content = body.content;
    post.writer = req.user.user_id;
    post.space_id = space_id;
    if (file) post.file = file.filename;
    else post.file = null;

    // 공지 작성 가능 여부 && 익명 작성 가능 여부 확인
    const category = body.category === '공지';
    if (participation) {
      // 권한 확인을 위한 space role 가져오기
      const spaceRole = await this.spaceRoleRepository.findOne({
        where: {
          role_id: participation.role,
        },
      });

      if (!category) {
        // 질문 작성 == 누구나 가능, 익명 여부는 선택에 따라
        post.category = category;
        post.anonymity = body.anonymity === 'true';
      } else if (spaceRole.authority && category) {
        // 관리자 권한 && 공지 작성 == 가능, 공지는 익명 불가
        post.category = category;
      } else if (!spaceRole.authority && category) {
        // 사용자 권한 && 공지 작성 == 차단
        throw new ForbiddenException();
      }
    } else {
      // 참여자가 아닌 경우 질문 && !익명 게시글만 등록 가능
      if (!category) {
        post.category = category;
      } else {
        throw new ForbiddenException();
      }
    }

    return await this.postRepository.save(post);
  }
}
