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
import { resizeImageFromBuffer } from 'src/utils/img-resize.util';
import { THUMBNAIL_RESIZE_HEIGHT } from 'src/common/img.constants';
import { PickUpPoint } from '../market/entities/pickup-point.entity';
import { MarketService } from '../market/market.service';

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

    private marketService: MarketService,
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

    const location: PickUpPoint =
      await this.marketService.getOneDeliveryLocation(item.locationId);

    const itemCreate: Item = this.itemRepository.create({
      owner,
      category,
      condition,
      status: ItemStatus.PUBLISHED,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      itemPrice: item.price,
      location,
    });

    item.img.forEach(({ image, thumbnail }) => {
      itemCreate.img.add(
        this.em.create(ItemImage, {
          image,
          thumbnail,
        }),
      );
    });

    await this.em.persistAndFlush(itemCreate);
  }

  async getItems(
    query: SearchItemDto,
  ): Promise<
    | { total: number; items: Item[] }
    | { nextCursor: number | string; items: Item[] }
  > {
    /**
     * If offset is not provided, we assume that the client wants to use cursor-based pagination
     */
    const isLimitOffset: boolean = typeof query.offset === 'number';

    const whereConditions: FilterQuery<Item> = { $and: [] };

    // nextCursor
    if (query.nextCursor) {
      whereConditions.$and.push({
        id: { $lt: query.nextCursor },
      });
    }
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

    if (query.campusId) {
      whereConditions.$and.push({
        location: {
          universityCampusLocation: { campusLocation: query.campusId },
        },
      });
    }

    if (query.universityId) {
      whereConditions.$and.push({
        location: {
          universityCampusLocation: { university: query.universityId },
        },
      });
    }

    if (query.ownerId) {
      whereConditions.$and.push({
        owner: query.ownerId,
      });
    }

    const [items, count] = await this.itemRepository.findAndCount(
      whereConditions,
      {
        populate: [
          'owner',
          'category',
          'condition',
          'img.image',
          'img.thumbnail',
        ],
        orderBy: {
          id: 'DESC',
        },
        limit: isLimitOffset ? query.limit : query.limit + 1,
        offset: isLimitOffset ? query.offset : undefined,
      },
    );

    /**
     * return 
     * - next cursor if count > limit, the last item in the array is the next cursor 
     * - else show empty to indicate no more items, return all items
     */
    return isLimitOffset
      ? { total: count, items }
      : { nextCursor: count > query.limit? items.pop()?.id : '', items };
  }

  async getOneItem(id: number): Promise<Item> {
    return await this.itemRepository.findOneOrFail(id, {
      populate: true,
      failHandler: findOneOrFailBadRequestExceptionHandler,
    });
  }

  async uploadItemImage(
    files: Array<Express.Multer.File>,
  ): Promise<{ image: Image; thumbnail: Image }[]> {
    const uploadTasks: Promise<{ image: Image; thumbnail: Image }>[] =
      files.map(async (file) => {
        const imgblockBlobClient: BlockBlobClient =
          this.imgContainerClientService.getBlockBlobClient(file.originalname);

        const thumbnailBlockBlobClient: BlockBlobClient =
          this.imgContainerClientService.getBlockBlobClient(
            '/' + file.originalname + 'wx400',
          );
        try {
          // resize image to thumbnail
          const thumbnail: Buffer = await resizeImageFromBuffer(
            file.buffer,
            THUMBNAIL_RESIZE_HEIGHT,
          );

          // upload image to azure blob storage
          const [imgUpload, thumbnailUpload] = await Promise.all([
            imgblockBlobClient.uploadData(file.buffer, {
              blobHTTPHeaders: {
                blobContentType: file.mimetype,
              },
            }),
            thumbnailBlockBlobClient.uploadData(thumbnail, {
              blobHTTPHeaders: {
                blobContentType: file.mimetype,
              },
            }),
          ]);

          // create image entities to store in database
          return {
            image: this.em.create(Image, {
              imgPath: imgUpload._response.request.url,
            }),
            thumbnail: this.em.create(Image, {
              imgPath: thumbnailUpload._response.request.url,
            }),
          };
        } catch (error) {
          console.log(error);
          return;
        }
      });

    // Retrieve successfully uploaded images
    const imageUrls: { image: Image; thumbnail: Image }[] = (
      await Promise.all(uploadTasks)
    ).filter((imageUrl) => imageUrl);

    // Persist image entities to database
    const imagesToPersist: Image[] = [];

    for (const imageUrl of imageUrls) {
      imagesToPersist.push(imageUrl.image);
      imagesToPersist.push(imageUrl.thumbnail);
    }

    this.em.persistAndFlush(imagesToPersist);

    return imageUrls;
  }
}
