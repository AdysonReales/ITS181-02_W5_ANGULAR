export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  type?: 'auction_win' | 'buy_it_now';
}

export class Order {
  id!: string;
  orderNumber!: string;
  orderDate!: string;
  customerEmail!: string;
  customerName!: string;
  items!: OrderItem[];
  subtotal!: number;
  taxAndFee!: number;
  shipping!: number;
  totalAmount!: number;
  status!: 'Confirmed' | 'Shipped' | 'Delivered' | 'Processing';
  paymentMethod!: string;
  shippingAddress!: string;
}
