import { Injectable, signal } from '@angular/core';
import { Order, OrderItem } from '../model/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private STORAGE_KEY = 'gmart_orders_v2';
  public ordersSignal = signal<Order[]>([]);

  private defaultOrders: Order[] = [
    {
      id: 'ORD-98214',
      orderNumber: 'GM-2026-98214',
      orderDate: '2026-09-28',
      customerEmail: 'jane.doe@example.com',
      customerName: 'Jane Doe',
      items: [
        {
          productId: 6,
          productName: '17th Century Silver Repoussé Chalice',
          imageUrl: '/assets/photo-6.avif',
          price: 1450.00,
          quantity: 1,
          type: 'auction_win'
        }
      ],
      subtotal: 1450.00,
      taxAndFee: 145.00,
      shipping: 35.00,
      totalAmount: 1630.00,
      status: 'Delivered',
      paymentMethod: 'Escrow Wire Transfer (Verified)',
      shippingAddress: '742 Evergreen Terrace, Springfield, OR'
    },
    {
      id: 'ORD-76120',
      orderNumber: 'GM-2026-76120',
      orderDate: '2026-10-04',
      customerEmail: 'jane.doe@example.com',
      customerName: 'Jane Doe',
      items: [
        {
          productId: 3,
          productName: 'Victorian Mahogany Curio Display Cabinet',
          imageUrl: '/assets/photo-3.avif',
          price: 2400.00,
          quantity: 1,
          type: 'auction_win'
        }
      ],
      subtotal: 2400.00,
      taxAndFee: 240.00,
      shipping: 120.00,
      totalAmount: 2760.00,
      status: 'Shipped',
      paymentMethod: 'Antiquities Protected Credit Card',
      shippingAddress: '742 Evergreen Terrace, Springfield, OR'
    },
    {
      id: 'ORD-54199',
      orderNumber: 'GM-2026-54199',
      orderDate: '2026-10-08',
      customerEmail: 'collector@vintage.com',
      customerName: 'Arthur Pendelton',
      items: [
        {
          productId: 1,
          productName: '18th Century French Ormolu Mantel Clock',
          imageUrl: '/assets/photo-1.avif',
          price: 1650.00,
          quantity: 1,
          type: 'buy_it_now'
        }
      ],
      subtotal: 1650.00,
      taxAndFee: 165.00,
      shipping: 45.00,
      totalAmount: 1860.00,
      status: 'Processing',
      paymentMethod: 'Direct Bank Wire',
      shippingAddress: '12 Kensington High St, London, UK'
    }
  ];

  constructor() {
    this.initOrders();
  }

  private initOrders(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          this.ordersSignal.set(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse stored orders', e);
      }
    }
    this.ordersSignal.set(this.defaultOrders);
    this.saveOrders(this.defaultOrders);
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    this.ordersSignal.set(orders);
  }

  public getOrdersForCustomer(email: string): Order[] {
    if (!email) return [];
    return this.ordersSignal().filter(
      (o) => o.customerEmail.toLowerCase() === email.toLowerCase()
    );
  }

  public getAllOrders(): Order[] {
    return this.ordersSignal();
  }

  public placeOrder(orderData: Partial<Order>): Order {
    const idNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      id: `ORD-${idNum}`,
      orderNumber: `GM-2026-${idNum}`,
      orderDate: new Date().toISOString().split('T')[0],
      customerEmail: orderData.customerEmail || 'jane.doe@example.com',
      customerName: orderData.customerName || 'Jane Doe',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      taxAndFee: orderData.taxAndFee || Math.round((orderData.subtotal || 0) * 0.1),
      shipping: orderData.shipping || 25,
      totalAmount: orderData.totalAmount || ((orderData.subtotal || 0) * 1.1 + 25),
      status: 'Confirmed',
      paymentMethod: orderData.paymentMethod || 'Vintage Escrow & Card',
      shippingAddress: orderData.shippingAddress || '742 Evergreen Terrace, Springfield, OR'
    };

    const current = [newOrder, ...this.ordersSignal()];
    this.saveOrders(current);
    return newOrder;
  }
}
