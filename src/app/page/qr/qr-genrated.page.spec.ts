import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrGenratedPage } from './qr-genrated.page';

describe('QrGenratedPage', () => {
  let component: QrGenratedPage;
  let fixture: ComponentFixture<QrGenratedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrGenratedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
