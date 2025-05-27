import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageRoutesPage } from './manage-routes.page';

describe('ManageRoutesPage', () => {
  let component: ManageRoutesPage;
  let fixture: ComponentFixture<ManageRoutesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageRoutesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
