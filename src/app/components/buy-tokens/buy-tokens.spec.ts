import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyTokens } from './buy-tokens';

describe('BuyTokens', () => {
  let component: BuyTokens;
  let fixture: ComponentFixture<BuyTokens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyTokens]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyTokens);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
