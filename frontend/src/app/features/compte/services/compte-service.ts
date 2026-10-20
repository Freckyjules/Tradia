import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Utilisateur } from '../../../core/auth/utilisateur';
import { LoginRequest } from '../models/login-request';
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

  /**
   * Connecte l'utilisateur via `POST /api/user/login`. L'API dépose elle-même le cookie de
   * session ; elle répond avec le nom de l'utilisateur (200) ou un 401 si les identifiants
   * sont incorrects.
   */
  connecter(demande: LoginRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>('/api/user/login', demande);
  }
}
