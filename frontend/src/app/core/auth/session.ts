import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { Utilisateur } from './utilisateur';

/** Temps laissé à l'API pour dire qui est connecté, avant d'afficher le site sans attendre. */
const DELAI_DE_REPONSE_EN_MS = 3000;

/**
 * Qui est connecté. Le cookie de session est géré par le navigateur : le site ne le voit
 * jamais, il demande seulement à l'API « qui suis-je ? ».
 */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly http = inject(HttpClient);
  private readonly utilisateurCourant = signal<Utilisateur | null>(null);

  /** L'utilisateur connecté, ou `null` si personne ne l'est. */
  readonly utilisateur = this.utilisateurCourant.asReadonly();

  /**
   * Retrouve la session ouverte, au chargement du site, avec `GET /api/user/me` : c'est
   * ce qui garde l'utilisateur connecté après la fermeture du navigateur.
   *
   * Ne lève jamais d'erreur : un 401 veut dire « personne n'est connecté », et une API
   * injoignable ou trop lente ne doit pas empêcher le site de s'afficher.
   */
  async charger(): Promise<void> {
    try {
      const utilisateur = await firstValueFrom(
        this.http.get<Utilisateur>('/api/user/me').pipe(timeout(DELAI_DE_REPONSE_EN_MS)),
      );
      this.utilisateurCourant.set(utilisateur);
    } catch {
      this.utilisateurCourant.set(null);
    }
  }

  /** Retient l'utilisateur qui vient de se connecter. */
  definir(utilisateur: Utilisateur): void {
    this.utilisateurCourant.set(utilisateur);
  }

  /** Oublie l'utilisateur : la session de l'API n'est plus valable. */
  effacer(): void {
    this.utilisateurCourant.set(null);
  }

  /**
   * Déconnecte l'utilisateur avec `POST /api/user/logout` : seule l'API peut effacer le
   * cookie de session, qui est illisible pour le site (`HttpOnly`).
   *
   * @returns `true` si l'utilisateur est déconnecté ; `false` si l'API n'a pas répondu, auquel
   * cas il reste connecté : mieux vaut le dire que lui faire croire qu'il est parti.
   */
  async deconnecter(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post<void>('/api/user/logout', null));
    } catch {
      return false;
    }

    this.effacer();
    return true;
  }
}
