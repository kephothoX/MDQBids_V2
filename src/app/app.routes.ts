import { Routes } from '@angular/router';
import { Admin } from './components/admin/admin';
import { ItemDetail } from './components/item-detail/item-detail';
import { HomeComponent } from './components/home/home';
import { Login } from './components/login/login';
import { BuyTokens } from './components/buy-tokens/buy-tokens';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', 'title': 'MDQBids', component: HomeComponent },
    { path: 'admin', title: 'Admin', component: Admin },
    { path: 'items/:id', component: ItemDetail },
    { path: 'login', title: 'App Login', component: Login },
    { path: 'buy-tokens', title: 'Buy MDQ Tokens', component: BuyTokens }
];

