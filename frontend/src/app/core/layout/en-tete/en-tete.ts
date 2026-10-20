import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { Session } from '../../auth/session';

/**
 * En-tête du site : le nom, et la navigation vers chaque partie. Il montre aussi qui est
 * connecté, avec de quoi se déconnecter, ou propose de se connecter.
 */
@Component({
  selector: 'app-en-tete',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './en-tete.html',
  styleUrl: './en-tete.scss',
})
export class EnTete {
  private readonly router = inject(Router);

  protected readonly session = inject(Session);

  /** Page où se trouve l'utilisateur : la connexion l'y ramène une fois terminée. */
  protected readonly urlCourante = toSignal(
    this.router.events.pipe(
      filter((evenement) => evenement instanceof NavigationEnd),
      map((evenement) => evenement.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly deconnexionEnCours = signal(false);

  /** `true` si la dernière déconnexion a échoué : l'utilisateur est alors toujours connecté. */
  protected readonly deconnexionEchouee = signal(false);

  /** Déconnecte l'utilisateur, puis l'envoie sur la page de connexion. */
  protected async deconnecter(): Promise<void> {
    if (this.deconnexionEnCours()) {
      return;
    }

    this.deconnexionEnCours.set(true);
    this.deconnexionEchouee.set(false);

    const deconnecte = await this.session.deconnecter();

    this.deconnexionEnCours.set(false);
    if (deconnecte) {
      await this.router.navigateByUrl('/compte/connexion');
    } else {
      this.deconnexionEchouee.set(true);
    }
  }
}
