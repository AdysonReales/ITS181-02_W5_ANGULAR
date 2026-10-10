import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { CustomerService } from '../service/customer-service.service';
import { Product } from '../model/product';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  // Reactive list of products
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);

  // Search & Filter state
  searchQuery: string = '';
  selectedFilter: 'all' | 'active' | 'sold' = 'all';
  selectedSort: 'ending_soon' | 'price_desc' | 'price_asc' | 'bids_desc' = 'ending_soon';
  selectedCategory: string = 'all';

  // Timer reference
  private timerInterval: any;
  private routeSub?: Subscription;

  // Notification toast
  toastMessage: string | null = null;
  toastType: 'success' | 'info' | 'error' = 'success';

  constructor(
    public productService: ProductService,
    public customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check query params (e.g. ?filter=sold or ?filter=active)
    this.routeSub = this.route.queryParams.subscribe((params) => {
      if (params['filter'] === 'sold') {
        this.selectedFilter = 'sold';
      } else if (params['filter'] === 'active') {
        this.selectedFilter = 'active';
      }
      this.applyFilters();
    });

    this.getProducts();

    // Start live 1-second countdown loop
    this.timerInterval = setInterval(() => {
      this.tickTimers();
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

  public getProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        console.log('Fetched products successfully:', data);
        this.products.set(data);
        this.applyFilters();
        // Crucial for Zoneless Angular: Force immediate change detection
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Failed to load products from backend:', err);
        // Fallback to locally stored products
        const fallback = this.productService.productsSignal();
        this.products.set(fallback);
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });
  }

  public applyFilters(): void {
    let list = [...this.products()];

    // Filter by search query
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      list = list.filter((p) => p.category === this.selectedCategory);
    }

    // Filter by sold / active status
    if (this.selectedFilter === 'active') {
      list = list.filter((p) => !p.isSold && !this.isTimerExpired(p.auctionEndTime));
    } else if (this.selectedFilter === 'sold') {
      list = list.filter((p) => p.isSold || this.isTimerExpired(p.auctionEndTime));
    }

    // Sort
    if (this.selectedSort === 'ending_soon') {
      list.sort((a, b) => {
        if (a.isSold && !b.isSold) return 1;
        if (!a.isSold && b.isSold) return -1;
        const timeA = a.auctionEndTime ? new Date(a.auctionEndTime).getTime() : 0;
        const timeB = b.auctionEndTime ? new Date(b.auctionEndTime).getTime() : 0;
        return timeA - timeB;
      });
    } else if (this.selectedSort === 'price_desc') {
      list.sort((a, b) => (b.currentBid || b.price) - (a.currentBid || a.price));
    } else if (this.selectedSort === 'price_asc') {
      list.sort((a, b) => (a.currentBid || a.price) - (b.currentBid || b.price));
    } else if (this.selectedSort === 'bids_desc') {
      list.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
    }

    this.filteredProducts.set(list);
    this.cdr.markForCheck();
  }

  private tickTimers(): void {
    let changed = false;
    const currentList = this.products();

    currentList.forEach((prod) => {
      if (!prod.isSold && prod.auctionEndTime && this.isTimerExpired(prod.auctionEndTime)) {
        prod.isSold = true;
        this.productService.markAsSold(prod.id);
        changed = true;
      }
    });

    if (changed) {
      this.applyFilters();
    }
  }

  public isTimerExpired(endTime?: string | Date): boolean {
    if (!endTime) return false;
    return new Date(endTime).getTime() <= Date.now();
  }

  public getTimeRemainingFormatted(endTime?: string | Date): string {
    if (!endTime) return 'Ending Soon';
    const totalMs = new Date(endTime).getTime() - Date.now();
    if (totalMs <= 0) return '00h 00m 00s';

    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

    const pad = (n: number) => (n < 10 ? '0' + n : n);

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
    }
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  public onQuickBid(product: Product): void {
    const user = this.customerService.currentUser();
    if (!user) {
      this.showToast('Please sign in to place a live bid.', 'error');
      return;
    }

    if (product.isSold || this.isTimerExpired(product.auctionEndTime)) {
      this.showToast('This auction has already ended.', 'error');
      return;
    }

    const current = product.currentBid || product.price || 100;
    const increment = current >= 1000 ? 100 : 50;
    const nextBid = current + increment;

    const ok = this.productService.placeBid(product.id, nextBid, user.fullName || user.username);
    if (ok) {
      product.currentBid = nextBid;
      product.bidCount = (product.bidCount || 0) + 1;
      product.highestBidder = user.fullName || user.username;
      this.showToast(`Bid of $${nextBid.toLocaleString()} placed successfully! You are highest bidder.`, 'success');
      this.cdr.detectChanges();
    }
  }

  public showToast(message: string, type: 'success' | 'info' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }

  public refreshCatalog(): void {
    this.showToast('Syncing catalog with backend...', 'info');
    this.getProducts();
  }
}