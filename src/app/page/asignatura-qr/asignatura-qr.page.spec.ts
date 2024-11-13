import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignaturaQrPage } from './asignatura-qr.page';

describe('AsignaturaQrPage', () => {
  let component: AsignaturaQrPage;
  let fixture: ComponentFixture<AsignaturaQrPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignaturaQrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
