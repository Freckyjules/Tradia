import { HttpErrorResponse } from '@angular/common/http';

/**
 * Corps d'une erreur de l'API (format standard `ProblemDetails`), avec le champ
 * `code` stable ajouté par l'API (ex. `User.UsernameTaken`).
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
}

/**
 * Lit le `code` d'une erreur HTTP de l'API.
 *
 * @returns le code, ou `undefined` si l'erreur n'est pas un `ProblemDetails`
 * (API injoignable, rejet avant le contrôleur…).
 */
export function lireCodeErreur(erreur: unknown): string | undefined {
  if (!(erreur instanceof HttpErrorResponse)) {
    return undefined;
  }
  const corps = erreur.error as ProblemDetails | null;
  return typeof corps?.code === 'string' ? corps.code : undefined;
}
