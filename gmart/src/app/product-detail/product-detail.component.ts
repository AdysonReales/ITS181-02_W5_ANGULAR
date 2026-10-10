import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { CustomerService } from '../service/customer-service.service';
import { Product } from '../model/product';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product?: Product;
  customBidAmount: number = 0;
  
  // Feedback toast
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | 'info' = 'success';

  private timerInterval: any;
  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public productService: ProductService,
    public customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadProduct(+idParam);
      }
    });

    this.timerInterval = setInterval(() => {
      this.checkTimer();
      this.cdr.markForCheck();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (data: Product) => {
        this.product = data;
        this.initBidAmount();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Failed to load product details', err);
        this.showToast('Unable to fetch lot details from backend.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  private initBidAmount(): void {
    if (!this.product) return;
    const current = this.product.currentBid || this.product.price || 100;
    const inc = current >= 1000 ? 100 : 50;
    this.customBidAmount = current + inc;
  }

  private checkTimer(): void {
    if (!this.product) return;
    if (!this.product.isSold && this.isTimerExpired(this.product.auctionEndTime)) {
      this.product.isSold = true;
      this.productService.markAsSold(this.product.id);
      this.cdr.markForCheck();
    }
  }

  public isTimerExpired(endTime?: string | Date): boolean {
    if (!endTime) return false;
    return new Date(endTime).getTime() <= Date.now();
  }

  public getTimeRemainingFormatted(endTime?: string | Date): string {
    if (!endTime) return 'Ended';
    const totalMs = new Date(endTime).getTime() - Date.now();
    if (totalMs <= 0) return '00h 00m 00s (Ended)';

    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

    const pad = (n: number) => (n < 10 ? '0' + n : n);

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  public get minNextBid(): number {
    if (!this.product) return 100;
    const current = this.product.currentBid || this.product.price || 100;
    return current + (current >= 1000 ? 100 : 50);
  }

  public onPlaceBid(): void {
    const user = this.customerService.currentUser();
    if (!user) {
      this.showToast('Please sign in to place a live bid.', 'error');
      setTimeout(() => this.router.navigate(['/sign-in']), 1500);
      return;
    }

    if (!this.product) return;

    if (this.product.isSold || this.isTimerExpired(this.product.auctionEndTime)) {
      this.showToast('This auction has already closed.', 'error');
      return;
    }

    if (this.customBidAmount < this.minNextBid) {
      this.showToast(`Bid must be at least $${this.minNextBid.toLocaleString()}`, 'error');
      return;
    }

    const bidderName = user.fullName || user.username;
    const ok = this.productService.placeBid(this.product.id, this.customBidAmount, bidderName);
    if (ok) {
      this.product.currentBid = this.customBidAmount;
      this.product.bidCount = (this.product.bidCount || 0) + 1;
      this.product.highestBidder = bidderName;
      this.product.history = [
        { bidder: bidderName, amount: this.customBidAmount, time: 'Just now' },
        ...(this.product.history || [])
      ];
      this.initBidAmount();
      this.showToast(`Congratulations! You placed a leading bid of $${this.customBidAmount.toLocaleString()}.`, 'success');
      this.cdr.detectChanges();
    }
  }

  public onBuyItNow(): void {
    const user = this.customerService.currentUser();
    if (!user) {
      this.showToast('Please sign in to complete purchase.', 'error');
      setTimeout(() => this.router.navigate(['/sign-in']), 1500);
      return;
    }

    if (!this.product) return;
    this.productService.placeBid(this.product.id, this.product.buyItNowPrice || this.product.price, user.fullName || user.username);
    this.product.isSold = true;
    this.productService.markAsSold(this.product.id);
    this.showToast('Item secured via Buy-It-Now! Redirecting to Bids & Cart...', 'success');
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 1200);
  }

  public showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 4500);
  }
}