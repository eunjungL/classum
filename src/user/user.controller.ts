import {Body, Controller, Post} from '@nestjs/common';
import {UserService} from "./user.service";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/login')
    login(@Body() body){
        return this.userService.login(body.email, body.password);
    }
}
