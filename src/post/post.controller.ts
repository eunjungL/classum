import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Post as PostEntity } from './post.entity';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

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

  @Post('/delete/:post_id')
  deletePost(@Req() req, @Param('post_id') post_id: string) {
    return this.postService.deletePost(req, Number(post_id));
  }
}
