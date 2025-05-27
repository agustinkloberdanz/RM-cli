import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageRoutesPage } from './manage-routes.page';

const routes: Routes = [
  {
    path: '',
    component: ManageRoutesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageRoutesPageRoutingModule {}
