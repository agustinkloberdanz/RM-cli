import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageRoutesPageRoutingModule } from './manage-routes-routing.module';

import { ManageRoutesPage } from './manage-routes.page';
import { AddRouteComponent } from 'src/app/Components/add-route/add-route.component';
import { RouteComponent } from 'src/app/Components/route/route.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageRoutesPageRoutingModule
  ],
  declarations: [ManageRoutesPage, AddRouteComponent, RouteComponent],
})
export class ManageRoutesPageModule { }
