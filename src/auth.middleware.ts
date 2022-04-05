import {
  Injectable,
  NestMiddleware,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(@Req() req, res: Response, next: NextFunction) {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.split('Bearer ')[1];
      try {
        const user = jwt.verify(token, 'secret');
        req.user = user;
      } catch (e) {
        throw new UnauthorizedException();
      }
      next();
    } else {
      throw new UnauthorizedException();
    }
  }
}
