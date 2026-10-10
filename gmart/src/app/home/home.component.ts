import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../service/customer-service.service';
import { ProductService } from '../service/product.service';
import { Product } from '../model/product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];
  private timerInterval: any;

  // Quick listing form on home
  showQuickListingModal: boolean = false;
  listingSuccess: boolean = false;
  isSubmitting: boolean = false;

  newAntique = {
    name: '',
    category: 'Fine Relics',
    description: '',
    startingBid: 250,
    buyItNowPrice: 450,
    uom: 'piece',
    imageUrl: '/assets/photo-1.avif',
    durationHours: 24,
    condition: 'Excellent Antique Condition'
  };

  // Preset antique photography options
  presetImages = [
    { label: 'French Clock', url: '/assets/photo-1.avif' },
    { label: 'Ming Vase', url: '/assets/photo-2.avif' },
    { label: 'Mahogany Vitrine', url: '/assets/photo-3.avif' },
    { label: 'Art Deco Brooch', url: '/assets/photo-4.avif' },
    { label: 'Brass Telescope', url: '/assets/photo-5.avif' },
    { label: 'Silver Chalice', url: '/assets/photo-6.avif' },
    { label: 'Singing Bird Box', url: '/assets/photo-7.avif' },
    { label: 'Latin Manuscript', url: '/assets/photo-8.avif' }
  ];

  constructor(
    public customerService: CustomerService,
    public productService: ProductService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeatured();
    this.timerInterval = setInterval(() => {
      this.cdr.markForCheck();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private loadFeatured(): void {
    this.productService.getProducts().subscribe({
      next: (prods) => {
        // Show up to 4 active live lots
        this.featuredProducts = prods.slice(0, 4);
        this.cdr.detectChanges();
      },
      error: () => {
        this.featuredProducts = this.productService.productsSignal().slice(0, 4);
        this.cdr.detectChanges();
      }
    });
  }

  public getTimeRemainingFormatted(endTime?: string | Date): string {
    if (!endTime) return 'Ending Soon';
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

  public openListAntique(): void {
    const user = this.customerService.currentUser();
    if (!user) {
      // Must be signed in! Redirect to sign-in with query param
      this.router.navigate(['/sign-in'], { queryParams: { redirect: 'list' } });
      return;
    }
    this.showQuickListingModal = true;
    this.cdr.markForCheck();
  }

  public closeListModal(): void {
    this.showQuickListingModal = false;
    this.listingSuccess = false;
    this.cdr.markForCheck();
  }

  public submitListing(): void {
    const user = this.customerService.currentUser();
    if (!user) {
      this.router.navigate(['/sign-in']);
      return;
    }

    if (!this.newAntique.name || this.newAntique.name.trim() === '') {
      alert('Please enter an antique title.');
      return;
    }

    this.isSubmitting = true;
    const endTime = new Date(Date.now() + 1000 * 60 * 60 * this.newAntique.durationHours).toISOString();

    const lotPayload: Partial<Product> = {
      name: this.newAntique.name,
      description: this.newAntique.description || 'Rare authenticated antique piece from private collection.',
      imageUrl: this.newAntique.imageUrl,
      price: this.newAntique.startingBid,
      startingBid: this.newAntique.startingBid,
      currentBid: this.newAntique.startingBid,
      buyItNowPrice: this.newAntique.buyItNowPrice,
      uom: this.newAntique.uom,
      category: this.newAntique.category,
      condition: this.newAntique.condition,
      sellerName: user.fullName || user.username,
      sellerEmail: user.email,
      auctionEndTime: endTime,
      isSold: false
    };

    this.productService.createProduct(lotPayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.listingSuccess = true;
        this.loadFeatured();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeListModal();
          this.router.navigate(['/products']);
        }, 1800);
      },
      error: (err) => {
        console.error('Error listing antique', err);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}