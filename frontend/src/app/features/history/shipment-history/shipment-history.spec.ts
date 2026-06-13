import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentHistory } from './shipment-history';

describe('ShipmentHistory', () => {
  let component: ShipmentHistory;
  let fixture: ComponentFixture<ShipmentHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
