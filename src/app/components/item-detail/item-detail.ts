import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BidItem } from '../bid-item/bid-item';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



import { doc, getDoc, collection, query, where  } from 'firebase/firestore';
import { firestore } from '../../app.config';
import { Item } from   '../../models/item';

@Component({
  selector: 'app-item-detail',
  imports: [
    CommonModule,
    //BidItem,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './item-detail.html',
  styleUrl: './item-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetail implements OnInit {
  private route = inject(ActivatedRoute);
  public item = signal<Item | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    const itemId = this.route.snapshot.paramMap.get('id');
    console.log('itemId: ', itemId);

    if (itemId) {
      const docRef = collection(firestore, 'bid_items');
      console.log("Doc Ref:  ", docRef);

      const q = query(docRef, where("id", "==", itemId));

      console.log("Q: ", q);
      
     
      /*
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        this.item.set({ id: docSnap.id, ...(docSnap.data() as Omit<Item, 'id'>) });
      } else {
        console.log('No such document!');
      }*/
    }
  }
  
}
