import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaDocentePage } from './lista-docente.page';

describe('ListaDocentePage', () => {
  let component: ListaDocentePage;
  let fixture: ComponentFixture<ListaDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
