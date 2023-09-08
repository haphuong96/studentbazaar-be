import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import {
  findOneOrFailBadRequestExceptionHandler,
  findOneOrFailNotFoundExceptionHandler,
} from '../../utils/exception-handler.util';
import { CampusLocation } from './entities/campus.entity';
import { PickUpPoint } from './entities/pickup-point.entity';
import { SearchDeliveryLocationsQuery } from './dto/market.dto';
import { FilterQuery } from '@mikro-orm/core';
import { University } from './entities/university.entity';
import { UniversityCampus } from './entities/university-campus.entity';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(CampusLocation)
    private readonly campusRepository: EntityRepository<CampusLocation>,

    @InjectRepository(PickUpPoint)
    private readonly deliveryLocationRepository: EntityRepository<PickUpPoint>,

    @InjectRepository(University)
    private readonly universityRepository: EntityRepository<University>,

    private readonly em: EntityManager,
  ) {}

  async getUniversityByEmailAddress(emailAddress: string): Promise<University> {
    return await this.universityRepository.findOne(
      {
        emailAddressDomain: emailAddress.split('@')[1],
      },
      {
        populate: ['campuses'],
      },
    );
  }

  async getUniversityWithCampus(universityId: number, campusId: number) {
    return await this.em.findOneOrFail(
      UniversityCampus,
      {
        $and: [
          {
            university: universityId,
            campusLocation: campusId,
          },
        ],
      },
      {
        failHandler: findOneOrFailNotFoundExceptionHandler,
      },
    );
  }

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
    return await this.deliveryLocationRepository.find(whereConditions);
  }

  async getOneDeliveryLocation(id: number): Promise<PickUpPoint> {
    return await this.deliveryLocationRepository.findOneOrFail(id, {
      failHandler: findOneOrFailNotFoundExceptionHandler,
      populate: [
        'universityCampusLocation.campusLocation',
        'universityCampusLocation.university',
      ],
    });
  }

  async getOneCampus(id: number): Promise<CampusLocation> {
    return await this.campusRepository.findOneOrFail(id, {
      populate: ['universities'],
      failHandler: findOneOrFailNotFoundExceptionHandler,
    });
  }
}
