import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../service/customer-service.service';
import { Customer } from '../model/customer';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  identifier: string = 'jane.doe@example.com';
  password: string = 'password123';

  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  demoUsers: Customer[] = [];
  redirectTarget: string = '/products';

  constructor(
    public customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.demoUsers = this.customerService.getAvailableDemoUsers();
    this.route.queryParams.subscribe((params) => {
      if (params['redirect'] === 'list') {
        this.redirectTarget = '/create-order';
      }
    });
  }

  public onSignIn(): void {
    if (!this.identifier.trim() || !this.password.trim()) {
      this.errorMessage = 'Please provide both email/username and password.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.customerService.login(this.identifier, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.successMessage = `Welcome, ${user.fullName || user.username}!`;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigateByUrl(this.redirectTarget);
        }, 1000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid email or password.';
        this.cdr.detectChanges();
      }
    });
  }

  public loginWithDemo(demo: Customer): void {
    this.customerService.setCurrentUser(demo);
    this.successMessage = `Signed in as ${demo.fullName}!`;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.router.navigateByUrl(this.redirectTarget);
    }, 900);
  }
}
