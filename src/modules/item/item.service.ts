import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Item, ItemStatus } from './entities/item.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateItemDto, SearchItemDto } from './dto/item.dto';
import { User } from '../user/entities/user.entity';
import { ItemCategory } from './entities/category.entity';
import { ItemCondition } from './entities/condition.entity';
import { FilterQuery, FindOptions } from '@mikro-orm/core';
import { findOneOrFailBadRequestExceptionHandler } from 'src/utils/exception-handler.util';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { randomUUID } from 'crypto';
import { ItemImage } from './entities/image.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: EntityRepository<Item>,

    private readonly em: EntityManager,
  ) {}

  async createItem(item: CreateItemDto, userId: number): Promise<void> {
    const itemCreate: Item = this.itemRepository.create({
      owner: this.em.getReference(User, userId),
      category: this.em.getReference(ItemCategory, item.categoryId),
      condition: this.em.getReference(ItemCondition, item.conditionId),
      status: ItemStatus.PUBLISHED,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      itemPrice: item.price,
    });

    item.img.forEach((imgUrl) => {
      itemCreate.img.add(
        this.em.create(ItemImage, {
          imgPath: imgUrl,
        }),
      );
    });
    
    await this.em.persistAndFlush(itemCreate);
  }

  async getItems(query: SearchItemDto): Promise<Item[]> {
    const whereConditions: FilterQuery<Item> = { $and: [] };

    // Upon selecting a category, we want to show all items under that category and its subcategories
    if (query.categoryId) {
      whereConditions.$and.push({
        $or: [
          { category: query.categoryId },
          { category: { parent: query.categoryId } },
        ],
      });
    }

    if (query.q) {
      whereConditions.$and.push({
        itemName: { $like: `%${query.q}%` },
      });
    }

    return await this.itemRepository.find(whereConditions, {
      populate: ['owner', 'category', 'condition'],
      orderBy: {
        createdDatetime: 'DESC',
      },
    });
  }

  async getOneItem(id: number): Promise<Item> {
    return await this.itemRepository.findOneOrFail(id, {
      populate: true,
      failHandler: findOneOrFailBadRequestExceptionHandler,
    });
  }

  async uploadItemImage(files: Array<Express.Multer.File>): Promise<string[]> {
    const imageUrls: string[] = [];

    const blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );

    const containerName = 'item-images';

    const containerClient = blobServiceClient.getContainerClient(containerName);

    files.forEach(async (file) => {
      const blockBlobClient = containerClient.getBlockBlobClient(
        file.originalname + '_' + randomUUID(),
      );

      const options = { blobHTTPHeaders: { blobContentType: file.mimetype } };
      blockBlobClient.uploadData(file.buffer, options);
      imageUrls.push(blockBlobClient.url);
    });

    return imageUrls;
  }
}
