// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component'; // Import MapComponent

@NgModule({
  declarations: [
    MapComponent, // Declare MapComponent here
  ],
  imports: [
    AppComponent,
    BrowserModule,
    // other imports
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
