import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { pt_BR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppInitializerFactory, AppInitializerService } from './core/initializer/app-initializer.service';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

registerLocaleData(pt);

const APP_INITIALIZER_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: AppInitializerFactory,
    deps: [AppInitializerService],
    multi: true,
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    ...APP_INITIALIZER_PROVIDERS,
    provideNzI18n(pt_BR),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
