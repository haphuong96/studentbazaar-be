import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Item, ItemStatus } from './entities/item.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateItemDto } from './dto/item.dto';
import { User } from '../user/entities/user.entity';
import { ItemCategory } from './entities/category.entity';
import { ItemCondition } from './entities/condition.entity';

@Injectable()
export class ItemService {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepository: EntityRepository<Item>,

        private readonly em: EntityManager
    ) {}

    async createItem(item: CreateItemDto, userId: number): Promise<void> {
        const itemCreate : Item = this.itemRepository.create({
            owner: this.em.getReference(User, userId),
            category: this.em.getReference(ItemCategory, item.categoryId),
            condition: this.em.getReference(ItemCondition, item.conditionId),
            status: ItemStatus.PUBLISHED,
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            itemPrice: item.price
        })

        await this.em.persistAndFlush(itemCreate);
    }

    async getItems(): Promise<Item[]> {
        return await this.itemRepository.findAll({
            populate: ['owner', 'category', 'condition']
        });
    }
}