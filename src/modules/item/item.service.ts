import { BlockBlobClient } from '@azure/storage-blob';
import { FilterQuery, wrap } from '@mikro-orm/core';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ErrorCode,
  ErrorMessage,
} from '../../common/exceptions/constants.exception';
import { CustomUnauthorizedException } from 'src/common/exceptions/custom.exception';
import { ITEM_THUMBNAIL_RESIZE_HEIGHT } from 'src/common/img.constants';
import { findOneOrFailBadRequestExceptionHandler } from 'src/utils/exception-handler.util';
import { resizeImageFromBuffer } from 'src/utils/img-resize.util';
import { ImageBlobClientService } from '../azure-blob-storage/blob-client.service';
import { AzureStorageBlob } from '../azure-blob-storage/blob.entity';
import { PickUpPoint } from '../market/entities/pickup-point.entity';
import { MarketService } from '../market/market.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ItemCategoryService } from './category.service';
import { ItemConditionService } from './condition.service';
import { CreateItemDto, SearchItemDto, UpdateItemDto } from './dto/item.dto';
import { ItemCategory } from './entities/category.entity';
import { ItemCondition } from './entities/condition.entity';
import { ItemImage } from './entities/item-image.entity';
import { Item, ItemStatus } from './entities/item.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: EntityRepository<Item>,

    private itemCatService: ItemCategoryService,

    private itemConditionService: ItemConditionService,

    private userService: UserService,

    private readonly em: EntityManager,

    private imgBlobClientService: ImageBlobClientService,

    private configService: ConfigService,

    private marketService: MarketService,
  ) {}

  /**
   *
   * @param item
   * @param userId
   */
  async createItem(item: CreateItemDto, images: Express.Multer.File[], userId: number): Promise<void> {
    const owner: User = await this.userService.getUserById(userId);

    const category: ItemCategory =
      await this.itemCatService.getOneItemCategoryById(item.categoryId);

    const condition: ItemCondition =
      await this.itemConditionService.getOneItemConditionById(item.conditionId);

    const location: PickUpPoint =
      await this.marketService.getOneDeliveryLocation(item.locationId);

    // upload images to azure blob storage
    const uploadedImages = await this.uploadItemImage(images);

    // create item entity
    const itemCreate: Item = this.itemRepository.create({
      owner,
      category,
      condition,
      status: item.status ? item.status : ItemStatus.PUBLISHED,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      itemPrice: item.price,
      location,
    });

    uploadedImages.forEach(({ image, thumbnail }) => {
      itemCreate.img.add(
        this.em.create(ItemImage, {
          image,
          thumbnail
        }),
      );
    });

    await this.em.persistAndFlush(itemCreate);
  }

  async getItems(
    query: SearchItemDto,
    isOwnerRequest = false,
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

    // only show items that are published if items are viewed publicly
    if (!isOwnerRequest) {
      whereConditions.$and.push({ status: ItemStatus.PUBLISHED });
    }

    // Upon selecting a category, we want to show all items under that category and its subcategories
    // find all subcategories of the selected category
    const categoryTree: ItemCategory[] =
      await this.itemCatService.getItemCategoryTreeByCategoryId(
        query.categoryId,
      );

    if (query.categoryId) {
      whereConditions.$and.push({
        category: { $in: categoryTree },
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
          'owner.universityCampus.university',
          'owner.universityCampus.campusLocation',
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

    // count number of favorites for each item
    const itemsWithFavoriteCount: Promise<void>[] = items.map(async (item) => {
      wrap(item).assign({
        favoriteCount: await item.favoritedBy.loadCount(),
      });
    });

    await Promise.all(itemsWithFavoriteCount);

    /**
     * return
     * - next cursor if count > limit, the last item in the array is the next cursor
     * - else show empty to indicate no more items, return all items
     */
    return isLimitOffset
      ? { total: count, items }
      : { nextCursor: count > query.limit ? items.pop()?.id : '', items };
  }

  async getOneItem(itemId: number, userId?: number): Promise<Item> {
    console.log('itemId ', itemId);
    console.log('userId ', userId);

    const itemFound: Item = await this.itemRepository.findOneOrFail(itemId, {
      populate: [
        'owner',
        'owner.universityCampus.university',
        'location',
        'condition',
        'img.image',
        'img.thumbnail',
      ],
      failHandler: findOneOrFailBadRequestExceptionHandler,
    });

    if (userId) {
      // check if user added this item to favorites
      const user: User = await this.userService.getUserById(userId);

      await user.favoriteItems.init();

      wrap(itemFound).assign({
        isFavorite: user.favoriteItems.contains(itemFound) ? true : false,
      });
    }

    return itemFound;
  }

  async updateItem(
    item: UpdateItemDto,
    itemId: number,
    userId: number,
  ): Promise<Item> {
    const itemToUpdate: Item = await this.getOneItem(itemId);

    // Check if user is the owner of the item
    if (itemToUpdate.owner.id !== userId) {
      throw new CustomUnauthorizedException(
        ErrorMessage.INVALID_USER,
        ErrorCode.FORBIDDEN_INVALID_USER,
      );
    }

    if (item.status) {
      itemToUpdate.status = item.status;
    }

    await this.em.flush();

    return itemToUpdate;
  }

  async uploadItemImage(
    files: Array<Express.Multer.File>,
  ): Promise<{ image: AzureStorageBlob; thumbnail: AzureStorageBlob }[]> {
    console.log('files ', files);

    const uploadTasks: Promise<{
      image: AzureStorageBlob;
      thumbnail: AzureStorageBlob;
    }>[] = files.map(async (file: Express.Multer.File) => {
      const upload = await this.imgBlobClientService.uploadImage(file, [
        {
          height: ITEM_THUMBNAIL_RESIZE_HEIGHT,
        },
      ]);

      if (!upload) {
        return null;
      }

      // create image entities to store in database
      const image: AzureStorageBlob = this.em.create(AzureStorageBlob, {
        blobName: upload.imageUpload.blobName,
      });

      const thumbnail: AzureStorageBlob = upload.thumbnailUploads.map(
        (thumbnailUpload) =>
          this.em.create(AzureStorageBlob, {
            blobName: thumbnailUpload.blobName,
          }),
      )[0];

      return {
        image,
        thumbnail,
      };
    });

    // Retrieve successfully uploaded images
    const successUploads: {
      image: AzureStorageBlob;
      thumbnail: AzureStorageBlob;
    }[] = (await Promise.all(uploadTasks)).filter((blob) => blob);

    // Persist image entities to database
    const imagesToPersist: AzureStorageBlob[] = successUploads.reduce(
      (acc: AzureStorageBlob[], cur) => [...acc, cur.image, cur.thumbnail],
      [],
    );

    this.em.persistAndFlush(imagesToPersist);

    return successUploads;
  }

  async toggleUserFavoriteItem(itemId: number, userId: number): Promise<Item> {
    const item: Item = await this.getOneItem(itemId);

    const user: User = await this.userService.getUserById(userId);

    await Promise.all([user.favoriteItems.init()]);

    if (user.favoriteItems.contains(item)) {
      user.favoriteItems.remove(item);
    } else {
      user.favoriteItems.add(item);
    }

    await this.em.flush();

    wrap(item).assign({
      isFavorite: user.favoriteItems.contains(item) ? true : false,
    });

    return item;
  }

  async deleteItem(userName: string, itemId: number): Promise<boolean> {
    const item: Item = await this.getOneItem(itemId);
    if (!item) {
      throw new BadRequestException('Item does not exist!');
    }

    const user: User = await this.userService.getUserByUsername(userName);
    if (user.id !== item.owner.id) {
      throw new BadRequestException('You cannot delete your not item');
    }

    await this.em.removeAndFlush(item);
    return true;
  }
}
