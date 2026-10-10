import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { CustomerService } from '../service/customer-service.service';
import { OrderService } from '../service/order-service.service';
import { Product } from '../model/product';
import { OrderItem } from '../model/order';

interface UserAuctionBid {
  productId: number;
  userBid: number;
  status: 'leading' | 'outbid';
  product?: Product;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  activeBids: UserAuctionBid[] = [];
  wonItems: Product[] = [];
  
  // Checkout feedback
  isCheckingOut = false;
  checkoutSuccess = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | 'info' = 'success';

  private timerInterval: any;

  constructor(
    public productService: ProductService,
    public customerService: CustomerService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refreshBidsAndCart();

    this.timerInterval = setInterval(() => {
      this.refreshBidsAndCart(false);
      this.cdr.markForCheck();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  public get currentUser() {
    return this.customerService.currentUser();
  }

  public refreshBidsAndCart(forceCdr: boolean = true): void {
    const rawBids = this.productService.getUserBids();
    const allProducts = this.productService.productsSignal();

    // If user has no bids yet, seed a couple of interesting bids for demonstration
    if (rawBids.length === 0 && allProducts.length >= 2) {
      this.productService.recordUserBid(allProducts[0].id, allProducts[0].currentBid || 1650);
      this.productService.recordUserBid(allProducts[1].id, (allProducts[1].currentBid || 820));
    }

    this.activeBids = this.productService.getUserBids();

    // Check won items (auctions ended where user is highest bidder)
    const user = this.currentUser;
    const userName = user?.fullName || 'Jane Doe';

    this.wonItems = allProducts.filter((p) => {
      const expired = p.auctionEndTime ? new Date(p.auctionEndTime).getTime() <= Date.now() : false;
      return (p.isSold || expired) && (p.highestBidder === userName || p.highestBidder === 'Jane Doe');
    });

    if (forceCdr) {
      this.cdr.detectChanges();
    }
  }

  public getTimeRemainingFormatted(endTime?: string | Date): string {
    if (!endTime) return 'Ended';
    const totalMs = new Date(endTime).getTime() - Date.now();
    if (totalMs <= 0) return '00h 00m (Ended)';

    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  public isTimerExpired(endTime?: string | Date): boolean {
    if (!endTime) return false;
    return new Date(endTime).getTime() <= Date.now();
  }

  public raiseBid(bidItem: UserAuctionBid): void {
    if (!bidItem.product) return;
    const user = this.currentUser;
    if (!user) {
      this.showToast('Please sign in to place a bid.', 'error');
      return;
    }

    const current = bidItem.product.currentBid || bidItem.product.price || 100;
    const increment = current >= 1000 ? 100 : 50;
    const newBid = current + increment;

    this.productService.placeBid(bidItem.product.id, newBid, user.fullName || user.username);
    this.showToast(`Bid raised to $${newBid.toLocaleString()} on Lot #${bidItem.product.id}!`, 'success');
    this.refreshBidsAndCart();
  }

  public get subtotal(): number {
    return this.wonItems.reduce((acc, item) => acc + (item.currentBid || item.price || 0), 0);
  }

  public get buyersPremium(): number {
    return Math.round(this.subtotal * 0.1);
  }

  public get shippingCost(): number {
    return this.wonItems.length > 0 ? 35 : 0;
  }

  public get totalAmount(): number {
    return this.subtotal + this.buyersPremium + this.shippingCost;
  }

  public onCheckout(): void {
    const user = this.currentUser;
    if (!user) {
      this.showToast('Please sign in to proceed with checkout.', 'error');
      this.router.navigate(['/sign-in']);
      return;
    }

    if (this.wonItems.length === 0) {
      this.showToast('No won auctions available for checkout yet.', 'info');
      return;
    }

    this.isCheckingOut = true;

    const items: OrderItem[] = this.wonItems.map((w) => ({
      productId: w.id,
      productName: w.name,
      imageUrl: w.imageUrl,
      price: w.currentBid || w.price,
      quantity: 1,
      type: 'auction_win'
    }));

    const newOrder = this.orderService.placeOrder({
      customerEmail: user.email,
      customerName: user.fullName || user.username,
      items: items,
      subtotal: this.subtotal,
      taxAndFee: this.buyersPremium,
      shipping: this.shippingCost,
      totalAmount: this.totalAmount,
      shippingAddress: user.shippingAddress || '742 Evergreen Terrace, Springfield, OR'
    });

    setTimeout(() => {
      this.isCheckingOut = false;
      this.checkoutSuccess = true;
      this.showToast(`Order #${newOrder.orderNumber} confirmed! Redirecting to orders...`, 'success');
      this.cdr.detectChanges();

      setTimeout(() => {
        this.router.navigate(['/orders']);
      }, 1500);
    }, 1200);
  }

  public showToast(msg: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }
}