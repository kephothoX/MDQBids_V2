import { Routes } from '@angular/router';
import { Admin } from './components/admin/admin';
import { ItemDetail } from './components/item-detail/item-detail';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', 'title': 'MDQBids', component: HomeComponent },
    { path: 'admin', component: Admin },
    { path: 'items/:id', component: ItemDetail }
];

