import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { collection, query, addDoc, getDocs } from 'firebase/firestore';

import { HederaFungibleToken } from '../../hedera-fungible-token';
import { WalletService } from '../../wallet';


import { getStorage } from "firebase/storage";
import { MatSnackBar } from '@angular/material/snack-bar';
// import { Buffer } from 'buffer';
import { RouterLink } from '@angular/router';
import { app, environment, firestore } from '../../app.config';

import { Item } from '../../models/item';
import { BidItem } from '../bid-item/bid-item';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';




import {
  Client,
  PrivateKey,
  Wallet,
  //LocalProvider,
  AccountId,
  Hbar,
  LedgerId,
  

} from "@hashgraph/sdk";



@Component({
  selector: 'app-home',
  imports: [
    BidItem,
    MatButtonModule,
    MatIconModule,
    MatCardModule
],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  public items = signal<any[]>([]);
  public uploadProgress = signal(0);

  MyAccountID: string = environment.HEDERA_ACCOUNT_ID;
  MyPrivateKey: string = environment.HEDERA_PRIVATE_KEY;
  MyPublicKey: string = environment.HEDERA_PUBLIC_KEY;
  PrivateKey = PrivateKey.generateED25519();
  PublicKey = this.PrivateKey.publicKey;


  constructor(
    private _matSnackBar: MatSnackBar,
    private _walletService: WalletService,
    private _hederaFungibletoken: HederaFungibleToken
  ) { }

  public async fetchItems(): Promise<void> {
    const q = query(collection(firestore, 'bid_items'));
    const querySnapshot = await getDocs(q);
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    this.items.set(items);

    console.log('Items: ', this.items())
  }


  async ngOnInit() {
    //this.fetchItems();

    await this._walletService.WalletConn();
  
  }


  async ClientSetUp() {
    // If we weren't able to grab it, we should throw a new error
    if (!this.MyAccountID || !this.MyPrivateKey) {
      throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    //Create your Hedera Testnet client
    const client = Client.forTestnet();

    //Set your account as the client's operator
    client.setOperator(this.MyAccountID, this.MyPrivateKey);

    //Set the default maximum transaction fee (in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(1));

    //Set the maximum payment for queries (in Hbar)
    client.setDefaultMaxQueryPayment(new Hbar(2));

    return client;
  }


}