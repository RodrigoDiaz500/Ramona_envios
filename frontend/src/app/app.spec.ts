import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { App } from './app';

describe('App', () => {

  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it('debe crear la aplicación correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar el componente raíz', () => {
    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled).toBeTruthy();
  });
});