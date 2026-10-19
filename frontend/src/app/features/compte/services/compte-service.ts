import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../models/register-request';

/**
 * Appels à l'API concernant les comptes.
 */
@Injectable({ providedIn: 'root' })
export class CompteService {
  private readonly http = inject(HttpClient);

  /**
   * Crée un compte via `POST /api/user/register` (201 sans corps).
   * L'utilisateur n'est pas connecté pour autant.
   */
  inscrire(demande: RegisterRequest): Observable<void> {
    return this.http.post<void>('/api/user/register', demande);
  }
}
