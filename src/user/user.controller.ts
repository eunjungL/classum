import {Body, Controller, Get, Param, Post, Req} from '@nestjs/common';
import {UserService} from "./user.service";
import {User} from "./user.entity";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    readUsers(@Req() req): Promise<User[]> {
        return this.userService.readUsers(req);
    }

    @Get(':id')
    readOneUser(@Req() req, @Param('id') id: string): Promise<User> {
        return this.userService.readOneUser(req, Number(id));
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
