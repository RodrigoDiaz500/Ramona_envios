import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchManagement } from './branch-management';

describe('BranchManagement', () => {
  let component: BranchManagement;
  let fixture: ComponentFixture<BranchManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
