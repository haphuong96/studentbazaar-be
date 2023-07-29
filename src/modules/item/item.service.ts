import { Injectable } from '@nestjs/common';
import { Item, ItemStatus } from './entities/item.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateItemDto, SearchItemDto } from './dto/item.dto';
import { User } from '../user/entities/user.entity';
import { ItemCategory } from './entities/category.entity';
import { ItemCondition } from './entities/condition.entity';
import { FilterQuery } from '@mikro-orm/core';
import { findOneOrFailBadRequestExceptionHandler } from 'src/utils/exception-handler.util';
import { BlockBlobClient } from '@azure/storage-blob';
import { ItemImage } from './entities/item-image.entity';
import { UserService } from '../user/user.service';
import { ItemCategoryService } from './category.service';
import { ItemConditionService } from './condition.service';
import { ImageContainerClientService } from '../azure-blob-storage/img-container-client.service';
import { Image } from '../img/image.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: EntityRepository<Item>,

    private itemCatService: ItemCategoryService,

    private itemConditionService: ItemConditionService,

    private userService: UserService,

    private readonly em: EntityManager,

    private imgContainerClientService: ImageContainerClientService,
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

    item.img.forEach((image: Image) => {
      itemCreate.img.add(
        this.em.create(ItemImage, {
          image: image,
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
      populate: ['owner', 'category', 'condition', 'img.image'],
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

  async uploadItemImage(files: Array<Express.Multer.File>): Promise<Image[]> {
    const uploadTasks: Promise<Image>[] = files.map(async (file) => {
      const blockBlobClient: BlockBlobClient =
        this.imgContainerClientService.getBlockBlobClient(file.originalname);
      try {
        const result = await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
          },
        });

        // create image entities to store in database
        return this.em.create(Image, { imgPath: result._response.request.url });
      } catch (error) {
        console.log(error);
        return;
      }
    });

    // Retrieve successfully uploaded images
    const images: Image[] = (await Promise.all(uploadTasks)).filter(
      (image: Image) => image,
    );

    this.em.persistAndFlush(images);

    return images;
  }
}
