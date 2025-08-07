import { Injectable } from '@angular/core';

import { ACCOUNT_ID, PRIVATE_KEY } from './app.config';

import { Client, AccountId } from '@hashgraph/sdk';



@Injectable({
  providedIn: 'root'
})
export class AppService {
  API_URL = "https://5000-idx-mongovarsity-1731094466375.cluster-4ezwrnmkojawstf2k7vqy36oe6.cloudworkstations.dev/api/v1";

  client: Client;

  constructor(

  ) {
    const accountId: string = ACCOUNT_ID;
    const privateKey: string = PRIVATE_KEY;

    //Create your local client
    const node = { "127.0.0.1:50211": new AccountId(13) };

    // Pre-configured client for test network (testnet)
    this.client = Client.forTestnet()

    // Set the operator with the account ID and private key
    this.client.setOperator(accountId, privateKey);

  }


}
