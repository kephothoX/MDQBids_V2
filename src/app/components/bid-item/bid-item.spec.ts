import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidItem } from './bid-item';

describe('BidItem', () => {
  let component: BidItem;
  let fixture: ComponentFixture<BidItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
