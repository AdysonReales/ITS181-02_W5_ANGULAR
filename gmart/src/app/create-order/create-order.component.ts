import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../service/customer-service.service';
import { ProductService } from '../service/product.service';
import { Product } from '../model/product';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent implements OnInit {
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  antique = {
    name: '',
    category: 'Fine Relics',
    condition: 'Excellent Antique Condition',
    startingBid: 300,
    buyItNowPrice: 650,
    uom: 'piece',
    imageUrl: '/assets/photo-1.avif',
    durationHours: 24,
    description: ''
  };

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  public get currentUser() {
    return this.customerService.currentUser();
  }

  public signInAsDemo(): void {
    const demos = this.customerService.getAvailableDemoUsers();
    this.customerService.setCurrentUser(demos[0]);
    this.cdr.detectChanges();
  }

  public onSubmitListing(): void {
    const user = this.currentUser;
    if (!user) {
      this.errorMessage = 'You must be signed in to list an antique.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.antique.name.trim()) {
      this.errorMessage = 'Please provide an antique title or lot name.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const endTime = new Date(Date.now() + 1000 * 60 * 60 * this.antique.durationHours).toISOString();

    const payload: Partial<Product> = {
      name: this.antique.name,
      description: this.antique.description || 'Rare antique piece from private collection.',
      imageUrl: this.antique.imageUrl,
      price: this.antique.startingBid,
      startingBid: this.antique.startingBid,
      currentBid: this.antique.startingBid,
      buyItNowPrice: this.antique.buyItNowPrice,
      uom: this.antique.uom,
      category: this.antique.category,
      condition: this.antique.condition,
      sellerName: user.fullName || user.username,
      sellerEmail: user.email,
      auctionEndTime: endTime,
      isSold: false
    };

    this.productService.createProduct(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.successMessage = `Lot #${created.id} "${created.name}" listed successfully!`;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 2000);
      },
      error: (err) => {
        console.error('Failed to list antique', err);
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred while publishing to backend.';
        this.cdr.detectChanges();
      }
    });
  }
}
