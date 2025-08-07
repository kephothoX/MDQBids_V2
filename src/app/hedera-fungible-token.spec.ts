import { TestBed } from '@angular/core/testing';

import { HederaFungibleToken } from './hedera-fungible-token';

describe('HederaFungibleToken', () => {
  let service: HederaFungibleToken;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HederaFungibleToken);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
