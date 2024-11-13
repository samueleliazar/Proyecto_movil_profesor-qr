import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearRamoPage } from './crear-ramo.page';

describe('CrearRamoPage', () => {
  let component: CrearRamoPage;
  let fixture: ComponentFixture<CrearRamoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearRamoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
