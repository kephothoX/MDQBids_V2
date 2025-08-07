import { Component, Input } from '@angular/core';

import { CommonModule, CurrencyPipe } from '@angular/common';
import {RouterLink} from '@angular/router';

import { Item } from '../../models/item';

@Component({
  selector: 'app-bid-item',
  imports: [
    RouterLink,
    CommonModule,
    CurrencyPipe,
  ],
  templateUrl: './bid-item.html',
  styleUrl: './bid-item.css'
})
export class BidItem {
  @Input() item!: Item;
}
