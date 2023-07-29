import { Image } from "src/modules/img/image.entity";

export class CreateItemDto {
    itemName: string;
    itemDescription?: string;
    categoryId: number;
    conditionId?: number;
    price?: number;
    img: Image[];
}

export class SearchItemDto {
    q?: string;
    categoryId?: number; 
}