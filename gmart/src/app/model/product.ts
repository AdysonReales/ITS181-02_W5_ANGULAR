/*export class Product {
  id!: number;
  title!: string;
  imagePath!: string;
  description!: string;
  sellerId!: string;
  currentBid!: number;
  buyItNowPrice?: number;
  auctionEndTime!: Date;
  highestBidderId?: string;
}*/

export class Product {
  id!: number;
  name!: string;
  description!: string;
  imageUrl!: string;
  uom!: string;
  price!: number;
}