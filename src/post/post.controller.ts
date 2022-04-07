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
import { PostService } from './post.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Post as PostEntity } from './post.entity';
import { Chat } from './chat.entity';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  // 특정 space 의 모든 post 읽기
  @Get(':space_id')
  readAllPost(@Req() req, @Param('space_id') space_id: string) {
    return this.postService.readAllPost(req, Number(space_id));
  }

  // 특정 게시글 댓글 보기
  @Get('chat/:post_id')
  readChat(@Req() req, @Param('post_id') post_id: string) {
    return this.postService.readChat(req, Number(post_id));
  }

  // 특정 space 의 특정 post 읽기
  @Get(':space_id/:post_id')
  readPost(@Req() req, @Param() param) {
    const space_id = param.space_id;
    const post_id = param.post_id;
    return this.postService.readPost(req, Number(space_id), Number(post_id));
  }

  // post 등록
  @Post(':space_id')
  @UseInterceptors(FileInterceptor('file'))
  createPost(
    @Body() body,
    @Req() req,
    @Param('space_id') space_id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PostEntity> {
    return this.postService.createPost(body, req, Number(space_id), file);
  }

  // post 삭제
  @Post('/delete/:post_id')
  deletePost(@Req() req, @Param('post_id') post_id: string) {
    return this.postService.deletePost(req, Number(post_id));
  }

  // chat 등록
  @Post('chat/:post_id')
  createChat(
    @Body() body,
    @Req() req,
    @Param('post_id') post_id: string,
  ): Promise<Chat> {
    return this.postService.createChat(body, req, Number(post_id));
  }

  // reply 등록
  @Post('chat/reply/:chat_id')
  createReply(
    @Body() body,
    @Req() req,
    @Param('chat_id') chat_id: string,
  ): Promise<Chat> {
    return this.postService.createReply(body, req, Number(chat_id));
  }

  // chat and reply 삭제
  @Post('chat/delete/:chat_id')
  deleteChat(@Req() req, @Param('chat_id') chat_id: string): Promise<Chat> {
    return this.postService.deleteChat(req, Number(chat_id));
  }
}
