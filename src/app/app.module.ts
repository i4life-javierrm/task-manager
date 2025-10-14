// File: app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // 💡 REQUIRED FOR TOASTR

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 

import { AuthInterceptor } from './services/auth-interceptor'; 

import { ToastrModule } from 'ngx-toastr';

@NgModule({ 
  declarations: [AppComponent],
  imports: [ 
    BrowserModule, 
    BrowserAnimationsModule, // 🚨 ADDED TO FIX TOASTR DEPENDENCY
    IonicModule.forRoot(), 
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true, // 💡 ADDED: Prevents the same message from appearing twice
      timeOut: 4000,           // 💡 INCREASED: Ensures it stays visible for a decent amount of time
      extendedTimeOut: 1000,
      closeButton: true,
      disableTimeOut: false,
      easeTime: 300,
    }),
    AppRoutingModule, 
    HttpClientModule, 
  ],
  providers: [
    { 
      provide: RouteReuseStrategy, 
      useClass: IonicRouteStrategy 
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
}) 
export class AppModule {}