import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BidItem } from '../bid-item/bid-item';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { HederaFungibleToken } from '../../hedera-fungible-token';
import { AppService } from '../../app-service';
import { Account } from '../../models/account';



import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, TOPICID } from '../../app.config';
import { Item } from '../../models/item';
import { TopicMessageQuery, TopicMessageSubmitTransaction } from '@hashgraph/sdk';

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
    MatProgressBarModule
  ],
  templateUrl: './item-detail.html',
  styleUrl: './item-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetail implements OnInit {
  private route = inject(ActivatedRoute);
  TokenBalance: any;
  public BidItem = signal<Item | undefined>(undefined);
  CreatedAt: any;
  IFrameURL: SafeUrl = signal<string>('https://hashscan.io/testnet/tx/');
  Bids: any;

  GetAcctCredsFrmSessStorage: string = JSON.parse(JSON.stringify(`${window.sessionStorage.getItem('LoginAccountCredentials')}`));

  AccountCredentials: Account = this.GetAcctCredsFrmSessStorage ? JSON.parse(this.GetAcctCredsFrmSessStorage) : { account_id: '', private_key: '', evm_address: '' };

  loading = signal(true);

  constructor(
    private _hederaFungibleToken: HederaFungibleToken,
    private _appService: AppService,
    private _sanitizer: DomSanitizer,
    public _router: Router,
  ) { }


  async ngOnInit(): Promise<void> {
    if (!this.AccountCredentials.account_id || !this.AccountCredentials.private_key || !this.AccountCredentials.evm_address) {
      this.loading.set(false);
      this._router.navigate(['/login']);
    } else {
      this.loading.set(true);
      setTimeout(async () => {
        const itemId = this.route.snapshot.paramMap.get('id');
        console.log('itemId: ', itemId);

        if (itemId) {
          try {
            const docRef = collection(firestore, 'bid_items');
            console.log("Doc Ref: ", docRef);

            const q = query(docRef, where("id", "==", itemId));

            console.log("Q: ", q);

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              const bidItemData = doc.data() as Item;
              this.BidItem.set(bidItemData);
              this.CreatedAt = this.BidItem()?.timestamp.toDate()
              console.log('BidItem: ', this.BidItem());
              console.log(doc.id, " => ", doc.data());
            });
          } catch (error) {
            console.error("Error fetching bid item:", error);
          } finally {
            this.loading.set(false);
          }

        }
      });
      window.sessionStorage.setItem('HederaAccountID', this.AccountCredentials.account_id);
      window.sessionStorage.setItem('HederaPrivateKey', this.AccountCredentials.private_key);
      window.sessionStorage.setItem('EVMAddress', this.AccountCredentials.evm_address);

      console.log('Account Credentials', this.AccountCredentials);


      this.TokenBalance = (await this._hederaFungibleToken.getTokenBalance(this.AccountCredentials.account_id))['Size'];

    }
  }

  async submitBid(item_id: any, item_name: any, bid_amount: any) {

    //Create the transaction
    const txTopicMessageSubmit = await new TopicMessageSubmitTransaction()
      .setTopicId(TOPICID)
      .setMessage(`${window.sessionStorage.getItem('EVMAddress')} bids for a ${item_name} with item ID ${item_id}  for ${bid_amount}`);

    //Sign with the client operator private key and submit to a Hedera network
    const txTopicMessageSubmitResponse = await txTopicMessageSubmit.execute(this._appService.client);

    //Request the receipt of the transaction
    const receiptTopicMessageSubmitTx = await txTopicMessageSubmitResponse.getReceipt(this._appService.client);

    //Get the transaction consensus status
    const statusTopicMessageSubmitTx = receiptTopicMessageSubmitTx.status;

    //Get the transaction message
    const getTopicMessage = txTopicMessageSubmit.getMessage();

    //Get the transaction ID
    const txTopicMessageSubmitId = txTopicMessageSubmitResponse.transactionId.toString();


    window.location.href = `https://hashscan.io/testnet/tx/${txTopicMessageSubmitId}`;



  }

}
