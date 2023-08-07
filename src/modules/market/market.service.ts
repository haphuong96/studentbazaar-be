import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { findOneOrFailBadRequestExceptionHandler, findOneOrFailNotFoundExceptionHandler } from 'src/utils/exception-handler.util';
import { CampusLocation } from './entities/campus.entity';
import { PickUpPoint } from './entities/pickup-point.entity';
import { SearchDeliveryLocationsQuery } from './dto/market.dto';
import { FilterQuery } from '@mikro-orm/core';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(CampusLocation)
    private readonly campusRepository: EntityRepository<CampusLocation>,

    @InjectRepository(PickUpPoint)
    private readonly deliveryLocationRepository: EntityRepository<PickUpPoint>,

    private readonly em: EntityManager,
  ) {}

  async getCampusById(id: number): Promise<CampusLocation> {
    return await this.campusRepository.findOneOrFail(id, {
      failHandler: findOneOrFailBadRequestExceptionHandler,
    });
  }

  async getAllCampuses(): Promise<CampusLocation[]> {
    return await this.campusRepository.findAll({ populate: ['universities'] });
  }

  async getAllDeliveryLocations(
    query: SearchDeliveryLocationsQuery,
  ): Promise<PickUpPoint[]> {
    const whereConditions: FilterQuery<PickUpPoint> = { $and: [] };

    if (query.universityId) {
      whereConditions.$and.push({
        universityCampusLocation: { university: query.universityId },
      });
    }

    if (query.campusLocationId) {
      whereConditions.$and.push({
        universityCampusLocation: { campusLocation: query.campusLocationId },
      });
    }
    return await this.deliveryLocationRepository.find(
      whereConditions,
      {
        populate: [
          'universityCampusLocation.university',
          'universityCampusLocation.campusLocation',
        ],
      },
    );
  }

  async getOneDeliveryLocation(id: number): Promise<PickUpPoint> {
    return await this.deliveryLocationRepository.findOneOrFail(id, {
      populate: [
        'universityCampusLocation.university',
        'universityCampusLocation.campusLocation',
      ],
      failHandler: findOneOrFailNotFoundExceptionHandler
    });
  }

  async getOneCampus(id: number): Promise<CampusLocation> {
    return await this.campusRepository.findOneOrFail(id, {
      populate: ['universities'],
      failHandler: findOneOrFailNotFoundExceptionHandler
    });
  }
}
