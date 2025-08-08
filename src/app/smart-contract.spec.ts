import { TestBed } from '@angular/core/testing';

import { SmartContract } from './smart-contract';

describe('SmartContract', () => {
  let service: SmartContract;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartContract);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
