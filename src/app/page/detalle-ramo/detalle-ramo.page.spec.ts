import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleRamoPage } from './detalle-ramo.page';

describe('DetalleRamoPage', () => {
  let component: DetalleRamoPage;
  let fixture: ComponentFixture<DetalleRamoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleRamoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
