import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

/**
 * Vérifie que le front joint l'API, en appelant son endpoint de santé.
 */
@Injectable({ providedIn: 'root' })
export class EtatApi {
  private readonly http = inject(HttpClient);

  /**
   * Interroge `GET /api/health`.
   *
   * @returns `true` si l'API répond, `false` si elle est injoignable ou en erreur.
   * Ne lève jamais d'erreur : une API éteinte est un état à afficher, pas un plantage.
   */
  verifier(): Observable<boolean> {
    return this.http.get('/api/health', { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
