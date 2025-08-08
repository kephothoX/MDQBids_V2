import { Component, Input } from '@angular/core';

import { CommonModule, CurrencyPipe } from '@angular/common';
import {RouterLink} from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Item } from '../../models/item';

@Component({
  selector: 'app-bid-item',
  imports: [
    RouterLink,
    CommonModule,
    CurrencyPipe,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './bid-item.html',
  styleUrl: './bid-item.css'
})
export class BidItem {
  @Input() __Item!: Item;
}
