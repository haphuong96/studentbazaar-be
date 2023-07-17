import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';

import { ItemCategory } from './entities/category.entity';
import { nestChildrenEntitiesUtil } from 'src/utils/nest-children-entities.util';

@Injectable()
export class ItemCategoryService {
  constructor(
    @InjectRepository(ItemCategory)
    private readonly itemCatRepository: EntityRepository<ItemCategory>,

    private readonly em: EntityManager,
  ) {}

  async getAllItemCategories(): Promise<ItemCategory[]> {
    const catsFound: ItemCategory[] = await this.itemCatRepository.findAll();

    return nestChildrenEntitiesUtil(catsFound);
  }
}
