import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../service/customer-service.service';
import { ProductService } from '../../service/product.service';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  constructor(
    public customerService: CustomerService,
    public productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  public get currentUser() {
    return this.customerService.currentUser();
  }

  public get activeBidsCount(): number {
    return this.productService.getUserBids().length;
  }

  public onLogout(): void {
    this.customerService.logout();
    this.cdr.markForCheck();
  }

  public quickSwitchUser(): void {
    const demos = this.customerService.getAvailableDemoUsers();
    const current = this.currentUser;
    const nextUser = demos.find((d) => d.email !== current?.email) || demos[0];
    this.customerService.setCurrentUser(nextUser);
    this.cdr.markForCheck();
  }
}