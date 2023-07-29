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
import {
  BlobServiceClient,
  BlobUploadCommonResponse,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { randomUUID } from 'crypto';
import { ItemImage } from './entities/image.entity';
import { UserService } from '../user/user.service';
import { ItemCategoryService } from './category.service';
import { ItemConditionService } from './condition.service';
import { ImageBlockBlobClientService } from '../azure-blob-storage/img-block-blob-client.service';
import { CustomHttpException } from 'src/common/exceptions/custom.exception';
import {
  ErrorCode,
  ErrorMessage,
} from 'src/common/exceptions/constants.exception';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: EntityRepository<Item>,

    private itemCatService: ItemCategoryService,

    private itemConditionService: ItemConditionService,

    private userService: UserService,

    private readonly em: EntityManager,

    private imgBlockBlobClientService: ImageBlockBlobClientService,
  ) {}

  /**
   *
   * @param item
   * @param userId
   */
  async createItem(item: CreateItemDto, userId: number): Promise<void> {
    const owner: User = await this.userService.getUserById(userId);

    const category: ItemCategory =
      await this.itemCatService.getOneItemCategoryById(item.categoryId);

    const condition: ItemCondition =
      await this.itemConditionService.getOneItemConditionById(item.conditionId);

    const itemCreate: Item = this.itemRepository.create({
      owner,
      category,
      condition,
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
      populate: ['owner', 'category', 'condition', 'img'],
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
    const uploadTasks = files.map(async (file) => {
      const blockBlobClient: BlockBlobClient =
        this.imgBlockBlobClientService.getBlockBlobClient(file.originalname);
      try {
        const result = await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
          },
        });
        return result._response.request.url;
      } catch (error) {
        console.log(error);
        return '';
      }
    });
    const imageUrls: string[] = await Promise.all(uploadTasks);
    return imageUrls;
  }
}
