export class CreateItemDto {
    itemName: string;
    itemDescription?: string;
    categoryId: number;
    conditionId?: number;
    price?: number;
    img: string[];
}

export class SearchItemDto {
    q?: string;
    categoryId?: number; 
}