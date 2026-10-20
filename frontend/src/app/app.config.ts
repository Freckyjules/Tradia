import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { intercepteurSessionExpiree } from './core/api/intercepteur-session-expiree';
import { Session } from './core/auth/session';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([intercepteurSessionExpiree])),
    // Retrouve la session ouverte avant d'afficher le site : l'en-tête sait alors tout de suite
    // si l'utilisateur est connecté, au lieu de proposer « Se connecter » un instant.
    provideAppInitializer(() => inject(Session).charger()),
  ],
};
