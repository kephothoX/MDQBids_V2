import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { collection, query, addDoc, getDocs } from 'firebase/firestore';


import { AppService } from '../../app-service';
import { HederaFungibleToken } from '../../hedera-fungible-token';
import { SmartContract } from '../../smart-contract';
import { WalletService } from '../../wallet';


import { getStorage } from "firebase/storage";
import { MatSnackBar } from '@angular/material/snack-bar';
// import { Buffer } from 'buffer';
import { Router } from '@angular/router';
import { PRIVATE_KEY, environment, firestore } from '../../app.config';

import { Item } from '../../models/item';
import { Account } from '../../models/account';
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
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransferTransaction,
  AccountBalanceQuery,


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
  public BidItems = signal<any[]>([]);
  public uploadProgress = signal(0);

  MyAccountID: string = environment.HEDERA_ACCOUNT_ID;
  MyPrivateKey: string = environment.HEDERA_PRIVATE_KEY;
  MyPublicKey: string = environment.HEDERA_PUBLIC_KEY;
  PrivateKey = PrivateKey.generateED25519();
  PublicKey = this.PrivateKey.publicKey;

  GetAcctCredsFrmSessStorage: string = JSON.parse(JSON.stringify(`${window.sessionStorage.getItem('LoginAccountCredentials')}`));

  AccountCredentials: Account = this.GetAcctCredsFrmSessStorage ? JSON.parse(this.GetAcctCredsFrmSessStorage) : { account_id: '', private_key: '', evm_address: '' };


  constructor(
    private _matSnackBar: MatSnackBar,
    private _router: Router,
    private _appService: AppService,
    private _walletService: WalletService,
    private _smartContract: SmartContract,
    private _hederaFungibleToken: HederaFungibleToken
  ) { }

  public async fetchItems(): Promise<void> {
    const q = query(collection(firestore, 'bid_items'));
    const querySnapshot = await getDocs(q);
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    this.BidItems.set(items);

    console.log('Items: ', this.BidItems())
  }


  async ngOnInit() {
    if (!this.AccountCredentials.account_id || !this.AccountCredentials.private_key || !this.AccountCredentials.evm_address) {
      this._router.navigate(['/login']);
    } else {
      window.sessionStorage.setItem('HederaAccountID', this.AccountCredentials.account_id);
      window.sessionStorage.setItem('HederaPrivateKey', this.AccountCredentials.private_key);
      window.sessionStorage.setItem('EVMAddress', this.AccountCredentials.evm_address);

      this.fetchItems();
      console.log('Account Credentials', this.AccountCredentials);


      this._hederaFungibleToken.getTokenBalance('0.0.6501023'); //`${ window.sessionStorage.getItem('HederaAccountID') }`)


      //this.submitMessage(`${await this.createTopic()}`, `${window.sessionStorage.getItem('Account')} successfully bids 23......`);
      //this.getTopicMessages(`${await this.createTopic()}`);
      //this.fetchItems();

      //await this._walletService.WalletConn();

      //await this._smartContract.callContract(`${ await this._smartContract.createContract() }`, 'tokenInfo');

    }

  }




  async ClientSetUp() {
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

  async createTopic() {
    const txCreateTopic = new TopicCreateTransaction();

    //Sign with the client operator private key and submit the transaction to a Hedera network
    const txCreateTopicResponse = await txCreateTopic.execute(this._appService.client);

    //Request the receipt of the transaction
    const receiptCreateTopicTx = await txCreateTopicResponse.getReceipt(this._appService.client);

    //Get the transaction consensus status
    const statusCreateTopicTx = receiptCreateTopicTx.status;

    //Get the Transaction ID
    const txCreateTopicId = txCreateTopicResponse.transactionId.toString();

    //Get the topic ID
    const topicId = receiptCreateTopicTx.topicId?.toString();

    console.log("------------------------------ Create Topic ------------------------------ ");
    console.log("Receipt status           :", statusCreateTopicTx.toString());
    console.log("Transaction ID           :", txCreateTopicId);
    console.log("Hashscan URL             :", "https://hashscan.io/testnet/tx/" + txCreateTopicId);
    console.log("Topic ID                 :", topicId);

    return topicId;
  }


  async submitMessage(topicId: string, message: string) {

    console.log('Message:   ', message);
    console.log('TopicID:  ', topicId);
    console.log('Account:  ', window.sessionStorage.getItem('Account'));

    const txTopicMessageSubmit = new TopicMessageSubmitTransaction()
      .setTopicId(topicId) //Fill in the topic ID
      .setMessage(message);

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



    console.log("-------------------------------- Submit Message -------------------------------- ");
    console.log("Receipt status           :", statusTopicMessageSubmitTx.toString());
    console.log("Transaction ID           :", txTopicMessageSubmitId);
    console.log("Hashscan URL             :", "https://hashscan.io/testnet/tx/" + txTopicMessageSubmitId);
    console.log("Topic Message            : " + getTopicMessage?.toString());
  }

  async getTopicMessages(topicId: string) {
    const getTopicMessagesParams = {
      topicId: topicId,             //Fill in the Topic ID                   //Fill in the maximum number of items to return
      order: "asc"                 //Fill in the order in which items are listed
    };

    const getTopicMessagesResponse = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/topics/${getTopicMessagesParams.topicId}/messages?order=${getTopicMessagesParams.order}`
    );

    if (!getTopicMessagesResponse.ok) {
      throw new Error(`HTTP error! status: ${getTopicMessagesResponse.status}`);
    }

    const getTopicMessagesData = await getTopicMessagesResponse.json();

    console.log("------------------------------ Get Topic Messages ------------------------------ ");
    console.log("Response status         :", getTopicMessagesResponse.status);
    console.log("Topic Messages          :", getTopicMessagesData.messages);
  }

  async TransferTokens(tokenId: string, from: string, to: string) {
    const txTransfer = new TransferTransaction()
      .addTokenTransfer(tokenId, from, -1) //Fill in the token ID 
      .addTokenTransfer(tokenId, to, 1) //Fill in the token ID and receiver account
      .freezeWith(this._appService.client);

    //Sign with the sender account private key
    const signTxTransfer = await txTransfer.sign(PrivateKey.fromStringED25519(PRIVATE_KEY));

    //Sign with the client operator private key and submit to a Hedera network
    const txTransferResponse = await signTxTransfer.execute(this._appService.client);

    //Request the receipt of the transaction
    const receiptTransferTx = await txTransferResponse.getReceipt(this._appService.client);

    //Obtain the transaction consensus status
    const statusTransferTx = receiptTransferTx.status;

    //Get the Transaction ID
    const txTransferId = txTransferResponse.transactionId.toString();

    console.log("--------------------------------- Token Transfer ---------------------------------");
    console.log("Receipt status           :", statusTransferTx.toString());
    console.log("Transaction ID           :", txTransferId);
    console.log("Hashscan URL             :", "https://hashscan.io/testnet/tx/" + txTransferId);
  }


}