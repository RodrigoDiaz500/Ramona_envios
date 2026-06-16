import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateShipmentStatus } from './update-shipment-status';

describe('UpdateShipmentStatus', () => {
  let component: UpdateShipmentStatus;
  let fixture: ComponentFixture<UpdateShipmentStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateShipmentStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateShipmentStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
