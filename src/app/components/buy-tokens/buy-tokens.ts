import { Component, OnInit } from '@angular/core';


import { Router } from '@angular/router';

import { AppService } from '../../app-service';
import { HederaFungibleToken } from '../../hedera-fungible-token';

import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import MetaMaskSDK from '@metamask/sdk';
import { ACCOUNT_ID, INFURA_API_KEY, PRIVATE_KEY, TOKENID } from '../../app.config';
import { Account } from '../../models/account';
import { AccountBalanceQuery, PrivateKey, TransferTransaction } from '@hashgraph/sdk';

@Component({
  selector: 'app-buy-tokens',
  imports: [
    MatSnackBarModule
  ],
  templateUrl: './buy-tokens.html',
  styleUrl: './buy-tokens.css'
})
export class BuyTokens implements OnInit {
  TokenBalance: any;

  GetAcctCredsFrmSessStorage: string = JSON.parse(JSON.stringify(`${window.sessionStorage.getItem('LoginAccountCredentials')}`));

  AccountCredentials: Account = this.GetAcctCredsFrmSessStorage ? JSON.parse(this.GetAcctCredsFrmSessStorage) : { account_id: '', private_key: '', evm_address: '' };


  constructor(
    private _appService: AppService,
    private _matSnackBar: MatSnackBar,
    private _hederaFungibleToken: HederaFungibleToken,
    private _router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.AccountCredentials.account_id || !this.AccountCredentials.private_key || !this.AccountCredentials.evm_address) {
      this._router.navigate(['/login']);
    } else {
      window.sessionStorage.setItem('HederaAccountID', this.AccountCredentials.account_id);
      window.sessionStorage.setItem('HederaPrivateKey', this.AccountCredentials.private_key);
      window.sessionStorage.setItem('EVMAddress', this.AccountCredentials.evm_address);


      console.log('Account Credentials', this.AccountCredentials);

      await this.BuyTokens();

    }
  }

  async BuyTokens() {

    const MSDK = new MetaMaskSDK({
      dappMetadata: {
        name: "MDQBids",
        url: window.location.href,
      },
      infuraAPIKey: INFURA_API_KEY,
    });

    await MSDK.connect();



    const snapId = `npm:@hashgraph/hedera-wallet-snap`;

    const ethereum = MSDK.getProvider();

    if (ethereum) {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });

      console.log('Ethereum Accounts: ', JSON.parse(JSON.stringify(accounts))[0]);
      window.sessionStorage.setItem('Account', JSON.parse(JSON.stringify(accounts))[0]);


      // Make requests
      const resulto = await ethereum.request({
        method: "eth_accounts",
        params: []
      });

      console.log('Make Requests: ', resulto);

      const snaps: any = await ethereum.request({ method: "wallet_getSnaps" });

      if (!Object.keys(snaps).includes(snapId)) {
        try {
          await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: {
              snapId,
              request: {
                method: 'hello',
                params: {
                  network: 'testnet',
                  mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com/'
                }
              }
            }
          });

          this._matSnackBar.open(`Snap installed:`, 'Dismiss');
        } catch (error) {
          this._matSnackBar.open(`User rejected Snap installation:  ${error}`, 'Dismiss');
        }
      } else {
        console.log('Snap ID:::::', snapId);


        const externalAccountParams = {
          externalAccount: {
            accountIdOrEvmAddress: window.sessionStorage.getItem('Account'),
            curve: 'ED25519'
          }
        }

        await ethereum.request({
          method: "wallet_requestSnaps",
          params: {
            "npm:@hashgraph/hedera-wallet-snap": {}
          },
        });

        const acctBalance = await window.ethereum.request({
          "method": "eth_getBalance",
          "params": [
            window.sessionStorage.getItem('Account'),
            "latest"
          ],
        });

        console.log('balance..............................', acctBalance);

        const transReq = await window.ethereum.request({
          "method": "eth_sendTransaction",
          "params": [
            {
              to: "0xef8CcBB6D8c4DDD7B042BDeEd03BB5eC4e5f6134",
              from: window.sessionStorage.getItem('EVMAddress'),
              gas: "0x76c0000000000000001",
              value: "0x8ac7230489e990000",
              gasPrice: "0x4a817c00000001"
            }
          ],
        }).transactionStatus

        console.log('Transaction Request:  ', transReq);

        if (!transReq) {

          this._hederaFungibleToken.transferToken(`${window.sessionStorage.getItem('HederaAccountID')}`, ACCOUNT_ID, TOKENID, this._appService.client, PrivateKey.fromStringED25519(PRIVATE_KEY));

          const tokenBalanceCheck = await new AccountBalanceQuery().setAccountId(`${window.sessionStorage.getItem('HederaAccountID')}`).execute(this._appService.client);
          console.log(`- Customers's balance: ${tokenBalanceCheck.tokens?._map.get(TOKENID)} units of token ID ${TOKENID}`);



        }
      }

    } else {
      this._matSnackBar.open("Please  Open 'https://metamask.io/download/' and Install MetaMask</a>.", 'Dismiss');
      alert("Non-MetaMask Ethereum provider detected.");
    }


  }


}
