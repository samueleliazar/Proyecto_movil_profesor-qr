import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RamosPage } from './ramos';

describe('ListaAlumnoPage', () => {
  let component: RamosPage;
  let fixture: ComponentFixture<RamosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RamosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
