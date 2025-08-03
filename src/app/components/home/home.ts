import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environments'


import { MatSnackBar } from '@angular/material/snack-bar';
import { Buffer } from 'buffer';


import {
  Client,
  PrivateKey,
  Wallet,
  //LocalProvider,
  Provider,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
  TokenType,
  TokenCreateTransaction,
  TokenSupplyType,
  TokenMintTransaction,
  PublicKey,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  FileCreateTransaction,
  FileInfoQuery

} from "@hashgraph/sdk";

import { Web3, MetaMaskProvider } from "web3";



declare global {
  interface Window {
    ethereum: any
  }
}



@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  MyAccountID: string = environment.HEDERA_ACCOUNT_ID;
  MyPrivateKey: string = environment.HEDERA_PRIVATE_KEY;
  MyPublicKey: string = environment.HEDERA_PUBLIC_KEY;
  PrivateKey = PrivateKey.generateED25519();
  PublicKey = this.PrivateKey.publicKey;


  constructor(
    private _matSnackBar: MatSnackBar
  ) { }


  async ngOnInit() {

    if (window.ethereum) {
      // use the injected Ethereum provider to initialize Web3.js

      const web3 = new Web3(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });


      const accounts = await web3.eth.getAccounts();
      // get the first account and populate placeholder

      window.sessionStorage.setItem('account', `Account: ${accounts[0]}`);




    } else {
      this._matSnackBar.open("Please  Open 'https://metamask.io/download/' and Install MetaMask</a>.", 'Dismiss');
      alert("Non-MetaMask Ethereum provider detected.");
    }

  }

  async connectWallet() {
    if (window.ethereum) {
      // use the injected Ethereum provider to initialize Web3.js

      const web3 = new Web3(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });


      const accounts = await web3.eth.getAccounts();
      // get the first account and populate placeholder

      window.sessionStorage.setItem('account', `Account: ${accounts[0]}`);




    } else {
      this._matSnackBar.open("Please  Open 'https://metamask.io/download/' and Install MetaMask</a>.", 'Dismiss');
      alert("Non-MetaMask Ethereum provider detected.");
    }
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