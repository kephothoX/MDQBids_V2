import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HederaFungibleToken } from './hedera-fungible-token';
import { AppService } from './app-service';
import { HeaderComponent } from './components/header/header.component';
import { AccountInfoQuery, TopicCreateTransaction } from '@hashgraph/sdk';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('MDQ Bids');

  constructor(
    private _appService: AppService,
    private _hederaFungibleToken: HederaFungibleToken
  ) { }

  async ngOnInit(): Promise<void> {
    const accountInfoQuery = new AccountInfoQuery()
      .setAccountId(`${window.sessionStorage.getItem('HederaAccountID')}`);

    //Sign with client operator private key and submit the query to a Hedera network
    const accountInfoQueryResponse = await accountInfoQuery.execute(this._appService.client);

    console.log("-------------------------------- Account Info ------------------------------");
    console.log("Query response           :", accountInfoQueryResponse);

    //Uncomment this 2 lines to create new token and topic. Subsequently update thier corresponding values on app.config.ts
    //await this.CreateNewToken();

    //await this.CreateNewTopic()


  }

  async CreateNewToken() {
    await this._hederaFungibleToken.CreateToken();
  }

  async CreateNewTopic() {
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

  }
}
