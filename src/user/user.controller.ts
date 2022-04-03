import {Body, Controller, Get, Param, Post, Req} from '@nestjs/common';
import {UserService} from "./user.service";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get(':id')
    findAllUser(@Param('id') id: string) {
        return this.userService.findUserById(Number(id));
    }

    @Post('/login')
    login(@Body() body){
        return this.userService.login(body.email, body.password);
    }

    @Post('/refresh')
    refresh(@Body() body) {
        return this.userService.refresh(body.refresh_token);
    }
}
