// File: app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // 👈 Import HTTP_INTERCEPTORS

import { AuthInterceptor } from './services/auth-interceptor'; // 👈 Import the Interceptor

@NgModule({ 
  declarations: [AppComponent],
  imports: [ 
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    HttpClientModule, // HTTP module is correct
  ],
  // 👈 Add the providers array to register the Interceptor
  providers: [
    { 
      provide: RouteReuseStrategy, 
      useClass: IonicRouteStrategy 
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true // Essential to allow multiple interceptors
    }
  ],
  bootstrap: [AppComponent]
}) 
export class AppModule {}