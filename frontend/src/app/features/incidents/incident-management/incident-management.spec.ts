import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentManagement } from './incident-management';

describe('IncidentManagement', () => {
  let component: IncidentManagement;
  let fixture: ComponentFixture<IncidentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
