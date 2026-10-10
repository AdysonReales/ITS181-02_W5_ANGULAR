import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../service/order-service.service';
import { CustomerService } from '../service/customer-service.service';
import { Order } from '../model/order';
import { Customer } from '../model/customer';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  displayedOrders: Order[] = [];
  selectedAccountFilter: string = 'current'; // 'current' | 'all' | specific email
  availableAccounts: Customer[] = [];

  constructor(
    public orderService: OrderService,
    public customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.availableAccounts = this.customerService.getAvailableDemoUsers();
    this.loadOrders();
  }

  public get currentUser() {
    return this.customerService.currentUser();
  }

  public loadOrders(): void {
    const all = this.orderService.getAllOrders();
    const user = this.currentUser;

    if (this.selectedAccountFilter === 'current') {
      if (user) {
        this.displayedOrders = all.filter(
          (o) => o.customerEmail.toLowerCase() === user.email.toLowerCase()
        );
      } else {
        this.displayedOrders = all;
      }
    } else if (this.selectedAccountFilter === 'all') {
      this.displayedOrders = all;
    } else {
      // Filter by specific email
      this.displayedOrders = all.filter(
        (o) => o.customerEmail.toLowerCase() === this.selectedAccountFilter.toLowerCase()
      );
    }

    this.cdr.detectChanges();
  }

  public onAccountFilterChange(filterValue: string): void {
    this.selectedAccountFilter = filterValue;
    this.loadOrders();
  }

  public switchActiveUser(user: Customer): void {
    this.customerService.setCurrentUser(user);
    this.selectedAccountFilter = 'current';
    this.loadOrders();
  }
}
