import { Injectable } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { HederaFungibleToken } from './hedera-fungible-token';
import { AppService } from './app-service';

import { PROJECT_ID, INFURA_API_KEY, ACCOUNT_ID, SUPPLYKEY } from './app.config';

import { MetaMaskSDK } from "@metamask/sdk";
import { AccountId } from '@hashgraph/sdk';

declare global {
  interface Window {
    ethereum: any
  }
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _hederaFungibletoken: HederaFungibleToken,
    private _appService: AppService,
    public _matSnackBar: MatSnackBar,
  ) { }


  async WalletConn() {

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

        const bsl = await window.ethereum.request({
          "method": "eth_getBalance",
          "params": [
            window.sessionStorage.getItem('Account'),
            "latest"
          ],
        });

        console.log('balance..............................', bsl);

        await window.ethereum.request({
          method: 'wallet_snap',
          params: {
            snapId,
            request: {
              method: 'hcs/accounts',
              params: {
                network: 'testnet',
                mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com'
              }
            }
          }
        });
      }

    } else {
      this._matSnackBar.open("Please  Open 'https://metamask.io/download/' and Install MetaMask</a>.", 'Dismiss');
      alert("Non-MetaMask Ethereum provider detected.");
    }


  }


}


