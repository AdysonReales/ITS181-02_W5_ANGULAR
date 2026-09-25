import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { OrdersComponent } from './orders/orders.component';
import { CartComponent } from './cart/cart.component';
import { CartitemsComponent } from './cartitems/cartitems.component';
import { OrderitemsComponent } from './orderitems/orderitems.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { TitleBarComponent } from './title-bar/title-bar.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    
    // Standalone components are imported here instead of declared
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    OrdersComponent,
    CartComponent,
    CartitemsComponent,
    OrderitemsComponent,
    ProductsComponent,
    ProductDetailComponent,
    TitleBarComponent,
    MenuBarComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }