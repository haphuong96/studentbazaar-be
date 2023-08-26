import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  AbstractSqlConnection,
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';
import { FilterQuery, wrap } from '@mikro-orm/core';
import { ItemCategory } from './entities/category.entity';
import { nestChildrenEntitiesUtil } from 'src/utils/nest-children-entities.util';
import { CustomBadRequestException } from 'src/common/exceptions/custom.exception';
import {
  findOneOrFailBadRequestExceptionHandler,
  findOneOrFailNotFoundExceptionHandler,
} from 'src/utils/exception-handler.util';

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

  async getOneItemCategory(search: {
    path?: string;
    id?: number;
  }): Promise<ItemCategory> {
    const whereConditions: FilterQuery<ItemCategory> = search.id
      ? { id: search.id }
      : { path: search.path };

    const catFound: ItemCategory = await this.itemCatRepository.findOneOrFail(
      whereConditions,
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

  async getOneItemCategoryById(id: number): Promise<ItemCategory> {
    return await this.itemCatRepository.findOneOrFail(id, {
      failHandler: findOneOrFailNotFoundExceptionHandler,
    });
  }

  /**
   * Get item category and all subcategories. Result is union.
   * @param id
   * @returns
   */
  async getItemCategoryTreeByCategoryId(
    categoryId: number,
  ): Promise<ItemCategory[]> {

    const connection: AbstractSqlConnection = this.em.getConnection();

    const query = `
                  WITH RECURSIVE parent_category AS ( 
                      SELECT 
                        * 
                      FROM 
                        item_category parent 
                      WHERE 
                        parent.id = ?
                      UNION ALL
                      SELECT 
                        children.* 
                      FROM 
                        parent_category parent, 
                        item_category children
                      WHERE 
                        children.parent_id = parent.id
                  )
                  SELECT * from parent_category;
                  `;

    const res = await connection.execute(query, [categoryId]);

    const itemCats = res.map((itemCat) => this.em.map(ItemCategory, itemCat));

    return itemCats;
  }
}
