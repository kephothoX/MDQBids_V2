import { Injectable } from '@angular/core';

import { AppService } from './app-service';



import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  AccountBalanceQuery,
  TransferTransaction,
  TokenAssociateTransaction,
  PrivateKey,
  TokenInfoQuery,
  ContractCreateFlow,
  Hbar,
  FileCreateTransaction,
  FileContentsQuery
} from '@hashgraph/sdk';
import { ACCOUNT_ID, PRIVATE_KEY, TREASURYACCOUNT, TREASURYKEY, SUPPLYKEY } from './app.config';

const SupplyKey = PrivateKey.generateECDSA();
const publicKey = SupplyKey.publicKey;

@Injectable({
  providedIn: 'root'
})
export class HederaFungibleToken {


  constructor(
    private _appService: AppService
  ) { }


  async getTokenBalance(account: string) {
    //Create the query
    const accountBalanceQuery = new AccountBalanceQuery()
      .setAccountId(account);

    //Sign with the client operator private key and submit to a Hedera network
    const accountTokenBalanceQueryResponse = await accountBalanceQuery.execute(this._appService.client);

    console.log("--------------------------------- Account Token Balance Query ---------------------------------");
    console.log("Account Token Balance           : ", accountTokenBalanceQueryResponse.tokens);
    return {Tokens:  accountTokenBalanceQueryResponse.tokens?.__map, Size: accountTokenBalanceQueryResponse.tokens?.__map.size };
  }




  async createFungibleToken(
    treasuryId: string,
    supplyKey: any,
    treasuryKey: any,
    client: any
  ): Promise<string> {
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("MDQ Bids Token")
      .setTokenSymbol("MDQBIDTOK")
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(2)
      .setInitialSupply(1000000000000)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .freezeWith(client);

    //SIGN WITH TREASURY KEY
    let tokenCreateSign = await tokenCreateTx.sign(treasuryKey);

    //SUBMIT THE TRANSACTION
    let tokenCreateSubmit = await tokenCreateSign.execute(client);

    //GET THE TRANSACTION RECEIPT
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);

    //GET THE TOKEN ID
    let tokenId: string = `${tokenCreateRx.tokenId}`;

    //LOG THE TOKEN ID TO THE CONSOLE
    console.log(`- Created token with ID: ${tokenId} \n`);
    window.sessionStorage.setItem('TokenID', tokenId);

    return tokenId;
  }

  async associateTokenWithAccount(
    treasuryId: string,
    kephothoId: string,
    tokenId: string,
    treasuryKey: any,
    client: any
  ) {
    //BALANCE CHECK
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens && balanceCheckTx.tokens._map ? balanceCheckTx.tokens._map.get(tokenId.toString()) : 0} units of token ID ${tokenId}`);
    var kephothoBalanceCheckTx = await new AccountBalanceQuery().setAccountId(kephothoId).execute(client);
    console.log(`- Kephotho's balance: ${kephothoBalanceCheckTx.tokens && kephothoBalanceCheckTx.tokens._map ? kephothoBalanceCheckTx.tokens._map.get(tokenId.toString()) : 0} units of token ID ${tokenId}`);

    // TRANSFER STABLECOIN FROM TREASURY TO kephotho
    let tokenTransferTx = await new TransferTransaction()
      .addTokenTransfer(tokenId, treasuryId, -5)
      .addTokenTransfer(tokenId, kephothoId, 5)
      .freezeWith(client)
      .sign(treasuryKey);

    //SUBMIT THE TRANSACTION
    let tokenTransferSubmit = await tokenTransferTx.execute(client);

    //GET THE RECEIPT OF THE TRANSACTION
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

    //LOG THE TRANSACTION STATUS
    console.log(`\n- Stablecoin transfer from Treasury to Kephotho: ${tokenTransferRx.status} \n`);

    // BALANCE CHECK
    var balanceCheckTxAfter = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTxAfter.tokens && balanceCheckTxAfter.tokens._map ? balanceCheckTxAfter.tokens._map.get(tokenId.toString()) : 0} units of token ID ${tokenId}`);
    var kephothoBalanceCheckTxAfter = await new AccountBalanceQuery().setAccountId(kephothoId).execute(client);
    console.log(`- kephotho's balance: ${kephothoBalanceCheckTxAfter.tokens && kephothoBalanceCheckTxAfter.tokens._map ? kephothoBalanceCheckTxAfter.tokens._map.get(tokenId.toString()) : 0} units of token ID ${tokenId}`);
  }

  async transferToken(
    customerId: string,
    treasuryId: string,
    tokenId: string,
    client: any,
    treasuryKey: any
  ) {

    //TRANSFER STABLECOIN FROM TREASURY TO ALICE
    let tokenTransferTx = await new TransferTransaction()
      .addTokenTransfer(tokenId, treasuryId, -5)
      .addTokenTransfer(tokenId, customerId, 5)
      .freezeWith(client)
      .sign(treasuryKey);
    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    console.log(`Stablecoin transfer from Treasury to Customer: ${tokenTransferRx.status} \n`);

    //BALANCE CHECK
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens?._map.get(tokenId.toString())} units of token ID ${tokenId}`);
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(customerId).execute(client);
    console.log(`- Customers's balance: ${balanceCheckTx.tokens?._map.get(tokenId.toString())} units of token ID ${tokenId}`);


  }


  async getFileContents(fileId: string, client: any) {
    //Create the query
    const query = new FileContentsQuery()
      .setFileId(fileId);

    //Sign with client operator private key and submit the query to a Hedera network
    const contents = await query.execute(this._appService.client);

    console.log(contents.toString());

    return contents.toString();
  }


  async play() {

    console.log(`ACCOUNT ID:   ${ACCOUNT_ID}`);
    console.log(`PRIVATE KEY:  ${PRIVATE_KEY}`);
    console.log(`TREASURY KEY: ${TREASURYKEY}`);
    console.log(`TREASURY ID:  ${TREASURYACCOUNT}`);
    console.log(`SUPPLY KEY:   ${SUPPLYKEY}`);
    console.log(`Supply Key:   ${SupplyKey}`);

    this.associateTokenWithAccount(
      ACCOUNT_ID,
      ACCOUNT_ID,
      await this.createFungibleToken(
        ACCOUNT_ID,
        SUPPLYKEY,
        SUPPLYKEY,
        this._appService.client
      ),
      SUPPLYKEY,
      this._appService.client
    );


    await this.transferToken(
      TREASURYACCOUNT,
      ACCOUNT_ID,
      await this.createFungibleToken(
        ACCOUNT_ID,
        SUPPLYKEY,
        SUPPLYKEY,
        this._appService.client
      ),
      
      this._appService.client,
      SUPPLYKEY
    );

    //Create the query
    const query = new AccountBalanceQuery()
      .setAccountId(TREASURYACCOUNT);

    //Sign with the client operator private key and submit to a Hedera network
    const tokenBalance = await query.execute(this._appService.client);

    console.log("The token balance(s) for this account: " + tokenBalance.tokens?.toString());

    //Create the query
    const query_1 = new TokenInfoQuery()
      .setTokenId(
        await this.createFungibleToken(
          ACCOUNT_ID,
          SUPPLYKEY,
          SUPPLYKEY,
          this._appService.client
        ),
      )
    //Sign with the client operator private key, submit the query to the network and get the token supply
    const tokenSupply = (await query_1.execute(this._appService.client)).totalSupply;

    console.log("The total supply of this token is " + tokenSupply);

  }

  async CreateToken() {
    const tokenId =  await this.createFungibleToken(
      ACCOUNT_ID,
      SUPPLYKEY,
      SUPPLYKEY,
      this._appService.client
    );

    return tokenId;
  }



}
