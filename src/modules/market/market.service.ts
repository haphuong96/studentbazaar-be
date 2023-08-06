import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { findOneOrFailBadRequestExceptionHandler } from 'src/utils/exception-handler.util';
import { CampusLocation } from './entities/campus.entity';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(CampusLocation)
    private readonly campusRepository: EntityRepository<CampusLocation>,

    private readonly em: EntityManager,
  ) {}

  async getCampusById(id: number): Promise<CampusLocation> {
    return await this.campusRepository.findOneOrFail(id, {
      failHandler: findOneOrFailBadRequestExceptionHandler,
    });
  }

  async getAllCampuses(): Promise<CampusLocation[]> {
    return await this.campusRepository.findAll({populate: ['universities']});
  }
}
