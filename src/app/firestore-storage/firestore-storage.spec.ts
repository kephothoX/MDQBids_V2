import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirestoreStorage } from './firestore-storage';

describe('FirestoreStorage', () => {
  let component: FirestoreStorage;
  let fixture: ComponentFixture<FirestoreStorage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirestoreStorage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirestoreStorage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
