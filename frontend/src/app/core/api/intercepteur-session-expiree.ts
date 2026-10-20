import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { Session } from '../auth/session';

/**
 * Quand l'API répond 401, la session n'est plus valable (cookie expiré, par exemple) :
 * le site l'oublie, et l'en-tête propose de nouveau de se connecter, sans attendre un
 * rechargement de la page.
 */
export const intercepteurSessionExpiree: HttpInterceptorFn = (requete, suite) => {
  const session = inject(Session);

  return suite(requete).pipe(
    tap({
      error: (erreur: unknown) => {
        if (erreur instanceof HttpErrorResponse && erreur.status === 401) {
          session.effacer();
        }
      },
    }),
  );
};
