import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// Removed: import { bootstrapApplication } from '@angular/platform-browser';
// Removed: import { provideAnimations } from '@angular/platform-browser/animations'; 
import { AppComponent } from './app/app.component'; // Included for context/completeness
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

// ❌ Removed the conflicting 'bootstrapApplication(AppComponent, ...)' block