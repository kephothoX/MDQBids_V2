import { Injectable } from '@angular/core';
import { ContractCallQuery, ContractCreateFlow } from '@hashgraph/sdk';

import { AppService } from './app-service';

import ByteCode from "../../public/contract_bytes.json";

@Injectable({
  providedIn: 'root'
})
export class SmartContract {

  constructor(
    private _appService: AppService
  ) { }

  async createContract() {
    //Create the transaction
    const contractCreate = new ContractCreateFlow()
      .setGas(10000000)
      .setBytecode(JSON.parse(JSON.stringify(ByteCode))['ByteCode']);

    //Sign the transaction with the client operator key and submit to a Hedera network
    const txResponse = contractCreate.execute(this._appService.client);

    console.log('Contract TXResponse: ', txResponse)

    //Get the receipt of the transaction
    const receipt = (await txResponse).getReceipt(this._appService.client);

    //Get the new contract ID
    const newContractId = (await receipt).contractId;

    console.log("The new contract ID is " + newContractId);

    return newContractId;


  }

  async callContract(contractId: string, func: string) {
    console.log('Contract ID: ', contractId);
    //Contract call query
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(0)
      .setFunction(func);

    //Sign with the client operator private key to pay for the query and submit the query to a Hedera network
    const contractCallResult = await query.execute(this._appService.client);

    // Get the function value
    const message = contractCallResult.getString(0);
    console.log("contract message: " + message);

    return message;

  }
}
