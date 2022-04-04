import {Controller, Get} from '@nestjs/common';
import {SpaceService} from "./space.service";
import {Space} from "./space.entity";

@Controller('space')
export class SpaceController {
    constructor(private spaceService: SpaceService) {}

    @Get()
    findAll(): Promise<Space[]> {
        return this.spaceService.findAll();
    }
}
