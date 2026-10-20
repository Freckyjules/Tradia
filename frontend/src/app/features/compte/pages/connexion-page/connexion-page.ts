import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { lireCodeErreur } from '../../../../core/api/probleme-api';
import { Session } from '../../../../core/auth/session';
import { urlDeRetourSure } from '../../../../core/auth/url-de-retour';
import { CompteService } from '../../services/compte-service';

/**
 * Page de connexion (US-3.2) : nom d'utilisateur et mot de passe. Après une connexion
 * réussie, renvoie l'utilisateur à la page où il était.
 */
@Component({
  selector: 'app-connexion-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './connexion-page.html',
  styleUrl: './connexion-page.scss',
})
export class ConnexionPage {
  private readonly compteService = inject(CompteService);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly urlDeRetour = urlDeRetourSure(
    inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl'),
  );

  /** Message transmis par la page précédente (état de navigation), s'il y en a un. */
  protected readonly message: string | undefined = (
    this.router.currentNavigation()?.extras.state as { message?: string } | undefined
  )?.message;

  protected readonly formulaire = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  /** `true` une fois le formulaire envoyé au moins une fois : avant, on ne réclame rien. */
  protected readonly soumis = signal(false);

  /** Message d'erreur de l'API (ou réseau), `null` s'il n'y en a pas. */
  protected readonly erreur = signal<string | null>(null);
  protected readonly envoiEnCours = signal(false);

  protected connecter(): void {
    if (this.envoiEnCours()) {
      return;
    }

    this.soumis.set(true);
    this.erreur.set(null);
    if (this.formulaire.invalid) {
      return;
    }

    this.envoiEnCours.set(true);
    this.compteService.connecter(this.formulaire.getRawValue()).subscribe({
      next: (utilisateur) => {
        this.session.definir(utilisateur);
        this.router.navigateByUrl(this.urlDeRetour);
      },
      error: (e: unknown) => {
        this.envoiEnCours.set(false);
        this.erreur.set(this.messagePour(e));
      },
    });
  }

  /** Choisit le message d'après le `code` de l'API, jamais d'après son texte. */
  private messagePour(e: unknown): string {
    switch (lireCodeErreur(e)) {
      case 'User.InvalidCredentials':
        return "Nom d'utilisateur ou mot de passe incorrect";
      default:
        return 'La connexion a échoué, réessayez plus tard.';
    }
  }
}
