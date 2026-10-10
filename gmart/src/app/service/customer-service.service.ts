import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { Customer } from '../model/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private USER_STORAGE_KEY = 'gmart_current_user';
  private ALL_USERS_KEY = 'gmart_all_users';

  // Demo users ready for instant login
  private defaultUsers: Customer[] = [
    {
      id: 1,
      username: 'jane_doe',
      email: 'jane.doe@example.com',
      fullName: 'Jane Doe',
      role: 'COLLECTOR',
      balance: 15400,
      joinedDate: '2024-01-15',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      shippingAddress: '742 Evergreen Terrace, Springfield, OR',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 2,
      username: 'antique_hunter',
      email: 'collector@vintage.com',
      fullName: 'Arthur Pendelton',
      role: 'DEALER',
      balance: 28950,
      joinedDate: '2023-08-20',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      shippingAddress: '12 Kensington High St, London, UK',
      phone: '+44 20 7946 0912'
    }
  ];

  // Reactive Signals for Zoneless Angular
  public currentUser = signal<Customer | null>(null);
  public isLoggedIn = computed(() => !!this.currentUser());

  constructor(private http: HttpClient) {
    this.initUser();
  }

  private initUser(): void {
    // Check localStorage first
    const savedUser = localStorage.getItem(this.USER_STORAGE_KEY);
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
        return;
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

    // Default to Jane Doe so user can immediately test all features without friction
    this.setCurrentUser(this.defaultUsers[0]);
  }

  public getAvailableDemoUsers(): Customer[] {
    const localUsers = this.getStoredUsers();
    return localUsers.length > 0 ? localUsers : this.defaultUsers;
  }

  private getStoredUsers(): Customer[] {
    const stored = localStorage.getItem(this.ALL_USERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return this.defaultUsers;
      }
    }
    localStorage.setItem(this.ALL_USERS_KEY, JSON.stringify(this.defaultUsers));
    return this.defaultUsers;
  }

  public setCurrentUser(user: Customer | null): void {
    this.currentUser.set(user);
    if (user) {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
  }

  public login(identifier: string, password: string): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/login`, { identifier, email: identifier, password }).pipe(
      tap((user) => {
        this.setCurrentUser(user);
      }),
      catchError(() => {
        // Local fallback for offline/standalone execution
        const all = this.getStoredUsers();
        const found = all.find(
          (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()
        );
        if (found) {
          this.setCurrentUser(found);
          return of(found);
        }
        // If not found in demo, synthesize login for local testing convenience
        const synthesized: Customer = {
          id: Date.now(),
          username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          email: identifier.includes('@') ? identifier : `${identifier}@gmart.local`,
          fullName: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          role: 'COLLECTOR',
          balance: 8500,
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          shippingAddress: '456 Grand Avenue, Suite 10, New York, NY'
        };
        this.saveUserLocally(synthesized);
        this.setCurrentUser(synthesized);
        return of(synthesized);
      })
    );
  }

  public register(data: { email: string; username: string; password?: string; fullName: string; phone?: string; address?: string }): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/register`, data).pipe(
      tap((user) => {
        this.saveUserLocally(user);
        this.setCurrentUser(user);
      }),
      catchError(() => {
        // Local fallback registration
        const newUser: Customer = {
          id: Date.now(),
          username: data.username || data.email.split('@')[0],
          email: data.email,
          fullName: data.fullName || data.username,
          role: 'COLLECTOR',
          balance: 10000,
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          shippingAddress: data.address || '100 Heritage Way, Boston, MA',
          phone: data.phone || '+1 (555) 019-2831'
        };
        this.saveUserLocally(newUser);
        this.setCurrentUser(newUser);
        return of(newUser);
      })
    );
  }

  public logout(): void {
    this.setCurrentUser(null);
  }

  private saveUserLocally(user: Customer): void {
    const list = this.getStoredUsers();
    const existingIdx = list.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx >= 0) {
      list[existingIdx] = user;
    } else {
      list.push(user);
    }
    localStorage.setItem(this.ALL_USERS_KEY, JSON.stringify(list));
  }
}
