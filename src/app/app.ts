import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

import { HederaFungibleToken } from './hedera-fungible-token';
import { AppService } from './app-service';
import { HeaderComponent } from './components/header/header.component';
import { AccountInfoQuery, TopicCreateTransaction } from '@hashgraph/sdk';
import { Account } from './models/account';


import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,

    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('MDQ Bids');

  GetAcctCredsFrmSessStorage: string = JSON.parse(JSON.stringify(`${window.sessionStorage.getItem('LoginAccountCredentials')}`));

  AccountCredentials: Account = this.GetAcctCredsFrmSessStorage ? JSON.parse(this.GetAcctCredsFrmSessStorage) : { account_id: '', private_key: '', evm_address: '' };


  constructor(
    private _appService: AppService,
    private _router: Router,
    private _hederaFungibleToken: HederaFungibleToken
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.AccountCredentials.account_id || !this.AccountCredentials.private_key || !this.AccountCredentials.evm_address) {
      this._router.navigate(['/login']);
    } else {
      window.sessionStorage.setItem('HederaAccountID', this.AccountCredentials.account_id);
      window.sessionStorage.setItem('HederaPrivateKey', this.AccountCredentials.private_key);
      window.sessionStorage.setItem('EVMAddress', this.AccountCredentials.evm_address);

      console.log('Account Credentials', this.AccountCredentials);
    }

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
