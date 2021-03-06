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
import { Chat } from './chat.entity';
import { PostRead } from './postRead.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(SpaceRole)
    private spaceRoleRepository: Repository<SpaceRole>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(PostRead)
    private postReadRepository: Repository<PostRead>,
  ) {}

  // id로 특정 post 찾기
  findPostById(post_id: number): Promise<Post> {
    return this.postRepository.findOne({
      where: {
        post_id: post_id,
      },
    });
  }

  // 참여자 정보 찾기
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

  // id로 특정 spaceRole 찾기
  findSpaceRoleById(role_id: number) {
    return this.spaceRoleRepository.findOne({
      where: {
        role_id: role_id,
      },
    });
  }

  // id로 특정 chat 찾기
  findChatById(chat_id: number) {
    return this.chatRepository.findOne({
      where: {
        chat_id: chat_id,
      },
    });
  }

  // 읽은 상태 가져오기
  findPostRead(post_id: number, user_id: number): Promise<PostRead> {
    return this.postReadRepository.findOne({
      where: {
        post_id: post_id,
        reader: user_id,
      },
    });
  }

  // post 상태 업데이트
  async updatePostState(post: Post, state: number): Promise<Post> {
    if (post) {
      post.state = state;
      return await this.postRepository.save(post);
    }
  }

  // 참여자의 참여 space Role 얻어오기
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
        removed: false,
      },
    });
    const userRole = await this.findUserRole(space_id, req.user.user_id);

    for (const post of posts) {
      if (
        // post 가 익명이고 사용자가 작성자도 아니고 space 의 관리자도 아닐 때 작성자 정보 삭제
        post.anonymity &&
        post.writer !== req.user.user_id &&
        !userRole.authority
      ) {
        delete post.writer;
      }
      const postRead = await this.findPostRead(post.post_id, req.user.user_id);
      if (postRead) {
        if (post.state === postRead.read_state) {
          // 게시글 상태와 읽은 상태가 동일하다면 표시할 상태가 없다.
          delete post.state;
        } // 이 외에는 게시글 상태가 표시할 상태이다.
      } else {
        // 게시글을 읽지 않았다면 무조건 새로운 게시글이라고 표시
        post.state = 0;
      }
    }
    return posts;
  }

  // 특정 space 의 특정 post 읽기
  async readPost(@Req() req, space_id: number, post_id: number): Promise<Post> {
    const post = await this.findPostById(post_id);
    const userRole = await this.findUserRole(space_id, req.user.user_id);

    if (post) {
      if (
        // post 가 익명이고 사용자가 작성자도 아니고 space 의 관리자도 아닐 때 작성자 삭제
        post.anonymity &&
        post.writer !== req.user.user_id &&
        !userRole.authority
      ) {
        delete post.writer;
      }

      // readPost 에 읽은 상태 등록
      const postRead = await this.findPostRead(post_id, req.user.user_id);
      if (postRead) {
        // 읽은 상태가 이전에 존재하면(읽은 기록이 있으면) 상태만 업데이트
        postRead.read_state = post.state;
        await this.postReadRepository.save(postRead);
      } else {
        // 읽은 상태가 없으면(처음 읽는 것이면) 새로 생성해서 등록
        const newPostRead = new PostRead();
        newPostRead.post_id = post_id;
        newPostRead.reader = req.user.user_id;
        newPostRead.read_state = post.state;
        await this.postReadRepository.save(newPostRead);
      }

      return post;
    } else throw new BadRequestException(); // 없는 post 읽기 시도
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
        // 질문 작성은 누구나 가능, 익명 여부는 선택에 따라
        post.category = category;
        post.anonymity = body.anonymity === 'true';
      } else if (spaceRole.authority && category) {
        // 관리자 권한이면 공지 작성, 공지는 익명이 불가하므로 선택권 X
        post.category = category;
      } else if (!spaceRole.authority && category) {
        // 사용자 권한이면 공지 작성 권한 없음
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

  // post 에 달린 chat 읽기
  async readChat(@Req() req, post_id: number): Promise<Chat[]> {
    const chats = await this.chatRepository.find({
      where: {
        post_id: post_id,
        removed: false,
      },
    });
    const post = await this.findPostById(post_id);
    const userRole = await this.findUserRole(post.space_id, req.user.user_id);

    if (userRole) {
      chats.forEach((chat) => {
        if (
          // chat 이 익명이고 사용자가 작성자도 아니고 space 의 관리자도 아닐때
          chat.anonymity &&
          chat.writer !== req.user.user_id &&
          !userRole.authority
        ) {
          delete chat.writer;
        }
      });

      return chats;
    } else throw new ForbiddenException(); // 참여자가 아니면 댓글 읽기 권한이 없는 것으로 설정
  }

  // Chat 등록
  async createChat(@Body() body, @Req() req, post_id: number): Promise<Chat> {
    const chat = new Chat();
    chat.post_id = post_id;
    chat.content = body.content;
    chat.writer = req.user.user_id;

    const post = await this.findPostById(post_id);
    if (post) {
      const participation = await this.findParticipationByUser(
        post.space_id,
        req.user.user,
      );

      if (participation) {
        // 참여자인 경우 익명 댓글 작성 가능
        chat.anonymity = body.anonymity === 'true';
      } else chat.anonymity = false; // 참여자가 아닌 경우 익명 댓글 작성 불가

      await this.updatePostState(post, 2);
      return this.chatRepository.save(chat);
    } else throw new BadRequestException(); // 없는 post 에 댓글 작성 시도
  }

  // Reply 등록
  async createReply(@Body() body, @Req() req, chat_id: number): Promise<Chat> {
    const chat = await this.findChatById(chat_id);
    if (chat) {
      const new_chat = new Chat();
      new_chat.post_id = chat.post_id;
      new_chat.content = body.content;
      new_chat.writer = req.user.user_id;
      new_chat.anonymity = body.anonymity === 'true';
      new_chat.is_reply = true;
      new_chat.reply_group = chat.chat_id;

      const post = await this.findPostById(chat.post_id);
      await this.updatePostState(post, 2);
      return await this.chatRepository.save(new_chat);
    } else throw new BadRequestException(); // 없는 chat 에 reply 작성 시도
  }

  // Reply 삭제
  async deleteReply(chat_id: number) {
    const replies = await this.chatRepository.find({
      where: { reply_group: chat_id },
    });
    if (replies) {
      // 답글이 있다면 함께 삭제
      for (const reply of replies) {
        reply.removed = true;
        await this.chatRepository.save(reply);
      }
    }
  }

  // Chat 삭제
  async deleteChat(@Req() req, chat_id: number): Promise<Chat> {
    const chat = await this.findChatById(chat_id);

    if (chat) {
      if (req.user.user_id === chat.writer) {
        // 작성자인 경우 삭제 가능
        // 답글이 있다면 함께 삭제
        await this.deleteReply(chat.chat_id);
        chat.removed = true;
        return await this.chatRepository.save(chat);
      } else {
        // 작성자 아닌 경우 관리자인지 확인
        const post = await this.findPostById(chat.post_id);
        const userRole = await this.findUserRole(
          post.space_id,
          req.user.user_id,
        );

        if (userRole && userRole.authority) {
          // 관리자인 경우 삭제 가능
          // 답글이 있다면 함께 삭제
          await this.deleteReply(chat.chat_id);
          chat.removed = true;
          return await this.chatRepository.save(chat);
        } else throw new ForbiddenException(); // 삭제 권한 없음
      }
    } else throw new BadRequestException(); // 없는 chat 삭제 시도
  }
}
