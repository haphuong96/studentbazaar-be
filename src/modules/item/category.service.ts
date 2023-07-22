import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { wrap } from '@mikro-orm/core';
import { ItemCategory } from './entities/category.entity';
import { nestChildrenEntitiesUtil } from 'src/utils/nest-children-entities.util';
import { CustomBadRequestException } from 'src/common/exceptions/custom.exception';
import { findOneOrFailBadRequestExceptionHandler } from 'src/utils/exception-handler.util';

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

  async getOneItemCategoryByPath(categoryPath: string): Promise<ItemCategory> {
    const catFound: ItemCategory = await this.itemCatRepository.findOneOrFail(
      {path: categoryPath},
      {
        populate: true,
        failHandler: findOneOrFailBadRequestExceptionHandler,
      },
    );

    const catFoundChildren: ItemCategory[] = await this.itemCatRepository.find({
      parent: catFound,
    });

    wrap(catFound).assign({ children: catFoundChildren });

    return catFound;
  }
}
