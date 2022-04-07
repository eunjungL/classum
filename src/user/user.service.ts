import {
  BadRequestException,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // ID로 특정 사용자 찾기
  findUserById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { user_id: id },
    });
  }

  // email 로 특정 사용자 찾기
  findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email: email },
    });
  }

  // 특정 사용자 정보 읽기
  async readUser(@Req() req, id: number): Promise<User> {
    const user = await this.findUserById(id);
    if (user) {
      if (user.email !== req.user.email) {
        delete user.email;
      }
      return user;
    } else {
      throw new BadRequestException();
    }
  }

  // 모든 사용자 정보 읽기
  async readAllUser(@Req() req): Promise<User[]> {
    const users = await this.userRepository.find();
    users.forEach((user) => {
      if (user.email !== req.user.email) {
        delete user.email;
      }
    });
    return users;
  }

  // 로그인
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (user && password === user.password) {
      const access_token = jwt.sign(
        {
          email: email,
          user_id: user.user_id,
          last_name: user.last_name,
          first_name: user.first_name,
        },
        'secret',
        {
          expiresIn: '1h',
        },
      );
      const refresh_token = jwt.sign(
        {
          user_id: user.user_id,
          email: email,
        },
        'secret',
        {
          expiresIn: '30d',
        },
      );
      return {
        access_token: access_token,
        refresh_token: refresh_token,
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  // refresh token 사용해 재로그인
  async refresh(token: string) {
    try {
      const user = jwt.verify(token, 'secret');
      const user_info = await this.findUserByEmail(user.email);
      const access_token = jwt.sign(
        {
          email: user.email,
          user_id: user_info.user_id,
          last_name: user_info.last_name,
          first_name: user_info.first_name,
        },
        'secret',
        {
          expiresIn: '1h',
        },
      );
      return {
        access_token: access_token,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
