import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { ItemCondition } from './entities/condition.entity';
import { findOneOrFailNotFoundExceptionHandler } from 'src/utils/exception-handler.util';

@Injectable()
export class ItemConditionService {
  constructor(
    @InjectRepository(ItemCondition)
    private readonly itemConditionRepository: EntityRepository<ItemCondition>,

    private readonly em: EntityManager,
  ) {}

  async getAllItemConditions(): Promise<ItemCondition[]> {
    return await this.itemConditionRepository.findAll();
  }

  async getOneItemConditionById(id: number): Promise<ItemCondition> {
    return await this.itemConditionRepository.findOneOrFail(id, {
      failHandler: findOneOrFailNotFoundExceptionHandler,
    });
  }
}
