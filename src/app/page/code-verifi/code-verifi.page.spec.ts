import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeVerifiPage } from './code-verifi.page';

describe('CodeVerifiPage', () => {
  let component: CodeVerifiPage;
  let fixture: ComponentFixture<CodeVerifiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeVerifiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
