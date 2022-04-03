import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";
const jwt = require('jsonwebtoken');

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    findUser(email: string): Promise<User> {
        return this.userRepository.findOne({
            where: {email: email}
        });
    }

    async login(email: string, password: string) {
        const user = await this.findUser(email);
        if (user && password === user.password) {
            const access_token = jwt.sign({
                email: email,
                user_id: user.user_id,
                last_name: user.last_name,
                first_name: user.first_name
            }, 'secret', {
                expiresIn: '1h'
            });
            const refresh_token = jwt.sign({
                user_id: user.user_id,
                email: email
            }, 'secret', {
                expiresIn: '30d'
            });
            return {
                access_token: access_token,
                refresh_token: refresh_token
            }
        } else {
            throw new UnauthorizedException();
        }
    }
}
