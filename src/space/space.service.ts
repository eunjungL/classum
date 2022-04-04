import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Space} from "./space.entity";
import {Repository} from "typeorm";

@Injectable()
export class SpaceService {
    constructor(
        @InjectRepository(Space) private spaceRepository: Repository<Space>
    ) {}

    findAll(): Promise<Space[]> {
        return this.spaceRepository.find();
    }
}
