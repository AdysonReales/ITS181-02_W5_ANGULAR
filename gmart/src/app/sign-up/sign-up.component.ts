import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../service/customer-service.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  form = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    address: '100 Heritage Way, Suite 4, Boston, MA',
    phone: '+1 (555) 019-2831'
  };

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    public customerService: CustomerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  public onSignUp(): void {
    if (!this.form.email.trim() || !this.form.password.trim() || !this.form.fullName.trim()) {
      this.errorMessage = 'Please complete all required fields (Name, Email, Password).';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.customerService.register({
      fullName: this.form.fullName,
      username: this.form.username || this.form.email.split('@')[0],
      email: this.form.email,
      password: this.form.password,
      address: this.form.address,
      phone: this.form.phone
    }).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.successMessage = `Account registered for ${user.fullName}! Welcome to G-Mart.`;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1200);
      },
      error: (err) => {
        console.error('Registration error', err);
        this.isLoading = false;
        this.errorMessage = 'Registration could not be completed. Please check your details.';
        this.cdr.detectChanges();
      }
    });
  }
}
