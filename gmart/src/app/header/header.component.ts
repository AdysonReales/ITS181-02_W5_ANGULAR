import { Component } from '@angular/core';
import { TitleBarComponent } from './title-bar/title-bar.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TitleBarComponent, MenuBarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {}