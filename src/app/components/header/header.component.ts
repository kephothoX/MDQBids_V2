import { Component,  AfterViewInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { HederaFungibleToken } from '../../hedera-fungible-token';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements AfterViewInit {
  TokenBalance: any = 0

  constructor (
    private _hederaFungibleToken: HederaFungibleToken
  ) {}


  async ngAfterViewInit() {
    this.TokenBalance = (await this._hederaFungibleToken.getTokenBalance(`${ window.sessionStorage.getItem('HederaAccountID') }`))['Size'];

    
  }

}
