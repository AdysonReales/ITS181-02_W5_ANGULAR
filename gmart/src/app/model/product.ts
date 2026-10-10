export interface BidRecord {
  bidder: string;
  amount: number;
  time: string;
}

export class Product {
  id!: number;
  name!: string;
  description!: string;
  imageUrl!: string;
  uom!: string;
  price!: number;

  // Antique Auction extensions
  currentBid?: number;
  startingBid?: number;
  buyItNowPrice?: number;
  bidCount?: number;
  highestBidder?: string;
  isSold?: boolean;
  auctionEndTime?: string; // ISO date string or formatted
  category?: string;
  condition?: string;
  sellerName?: string;
  sellerEmail?: string;
  history?: BidRecord[];
}