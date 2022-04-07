import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // 모든 사용자 정보 읽기
  @Get()
  readAllUser(@Req() req): Promise<User[]> {
    return this.userService.readAllUser(req);
  }

  // 특정 사용자 정보 읽기
  @Get(':id')
  readUser(@Req() req, @Param('id') id: string): Promise<User> {
    return this.userService.readUser(req, Number(id));
  }

  // 로그인
  @Post('/login')
  login(@Body() body) {
    return this.userService.login(body.email, body.password);
  }

  // refresh token 사용해 재로그인
  @Post('/refresh')
  refresh(@Body() body) {
    return this.userService.refresh(body.refresh_token);
  }
}
