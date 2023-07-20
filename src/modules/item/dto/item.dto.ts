export class CreateItemDto {
    itemName: string;
    itemDescription?: string;
    categoryId: number;
    conditionId?: number;
    price?: number;
}

export class SearchItemDto {
    q?: string;
    categoryId?: number; 
}