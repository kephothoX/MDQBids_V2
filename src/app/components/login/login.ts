import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { WalletService } from '../../wallet';

import { Account } from '../../models/account';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit{
  public accountId = new FormControl('');
  public privatekey = new FormControl('');


  constructor (
    private _router: Router,
    private _walletService: WalletService
  ) {}

  ngOnInit(): void {
    this._walletService.WalletConn();
  }

  newLoginForm = new FormGroup({
    accountId: this.accountId,
    privateKey: this.privatekey,
    
  });


  ngOnSubmit() {
    const formValues = this.newLoginForm.value;

    const newAccount: Account = {
      account_id: `${ formValues.accountId }`,
      private_key: `${ formValues.privateKey }`,
      evm_address: `${ window.sessionStorage.getItem('Account') }`
    };

    window.sessionStorage.setItem('LoginAccountCredentials', JSON.stringify(newAccount));
    setTimeout(() => {
      this._router.navigate(['/home']);
    });   


  }

}
