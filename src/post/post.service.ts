import {
  BadRequestException,
  Body,
  ForbiddenException,
  Injectable,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';
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

  findPostById(post_id: number): Promise<Post> {
    return this.postRepository.findOne({
      where: {
        post_id: post_id,
      },
    });
  }

  findParticipationByUser(
    space_id: number,
    user_id: number,
  ): Promise<Participation> {
    return this.participationRepository.findOne({
      where: {
        space_id: space_id,
        user_id: user_id,
      },
    });
  }

  findSpaceRoleById(role_id: number) {
    return this.spaceRoleRepository.findOne({
      where: {
        role_id: role_id,
      },
    });
  }

  // 참여자의 space Role 얻어오기
  async findUserRole(space_id: number, user_id: number): Promise<SpaceRole> {
    const participation = await this.findParticipationByUser(space_id, user_id);
    if (participation) {
      return await this.findSpaceRoleById(participation.role);
    } else return null;
  }

  // 특정 space 의 모든 Post 읽기
  async readAllPost(@Req() req, space_id: number) {
    const posts = await this.postRepository.find({
      where: {
        space_id: space_id,
      },
    });
    const userRole = await this.findUserRole(space_id, req.user.user_id);
    console.log(req.user.user_id);
    posts.forEach((post) => {
      if (
        // post 가 익명이고 사용자가 작성자가 아니거나 space 의 관리자가 아닐 때
        post.anonymity &&
        (post.writer !== req.user.user_id || !userRole.authority)
      ) {
        delete post.writer;
      }
    });
    return posts;
  }

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

  // post 삭제
  async deletePost(@Req() req, post_id: number) {
    const post = await this.findPostById(post_id);
    if (post) {
      if (req.user.user_id === post.writer) {
        // 작성자인 경우 삭제 가능
        post.removed = true;
        return await this.postRepository.save(post);
      } else {
        // 작성자가 아닌 경우 관리자인지 확인
        const participation = await this.findParticipationByUser(
          post.space_id,
          req.user.user_id,
        );

        if (participation) {
          const spaceRole = await this.findSpaceRoleById(participation.role);
          if (spaceRole.authority) {
            // 관리자인 경우 삭제 가능
            post.removed = true;
            return await this.postRepository.save(post);
          } else throw new ForbiddenException(); // 관리자 아니면 삭제 권한 없음
        } else throw new ForbiddenException(); // 참여자 아니면 삭제 권한 없음
      }
    } else throw new BadRequestException();
  }
}
