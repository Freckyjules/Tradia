import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { lireCodeErreur } from '../../../../core/api/probleme-api';
import { CompteService } from '../../services/compte-service';

/** Message affiché sur la page de connexion après une inscription réussie. */
export const MESSAGE_COMPTE_CREE = 'Compte créé, vous pouvez vous connecter';

const REGLE_NOM = '3 à 20 caractères : lettres, chiffres, « _ » ou « - ».';
const REGLE_MOT_DE_PASSE = 'Au moins 8 caractères (128 au maximum).';

/**
 * Page d'inscription (US-3.1) : nom d'utilisateur et mot de passe.
 * Après une inscription réussie, renvoie vers la connexion sans connecter l'utilisateur.
 */
@Component({
  selector: 'app-inscription-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inscription-page.html',
  styleUrl: './inscription-page.scss',
})
export class InscriptionPage {
  private readonly compteService = inject(CompteService);
  private readonly router = inject(Router);

  protected readonly regleNom = REGLE_NOM;
  protected readonly regleMotDePasse = REGLE_MOT_DE_PASSE;

  protected readonly formulaire = inject(FormBuilder).nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });

  /** Message d'erreur de l'API (ou réseau), `null` s'il n'y en a pas. */
  protected readonly erreur = signal<string | null>(null);
  protected readonly envoiEnCours = signal(false);

  protected inscrire(): void {
    if (this.envoiEnCours()) {
      return;
    }

    this.erreur.set(null);
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.envoiEnCours.set(true);
    this.compteService.inscrire(this.formulaire.getRawValue()).subscribe({
      next: () =>
        this.router.navigate(['/compte/connexion'], { state: { message: MESSAGE_COMPTE_CREE } }),
      error: (e: unknown) => {
        this.envoiEnCours.set(false);
        this.erreur.set(this.messagePour(e));
      },
    });
  }

  /** Choisit le message d'après le `code` de l'API, jamais d'après son texte. */
  private messagePour(e: unknown): string {
    switch (lireCodeErreur(e)) {
      case 'User.UsernameTaken':
        return "Ce nom d'utilisateur est déjà pris";
      case 'User.InvalidUsername':
        return `Nom d'utilisateur invalide. ${REGLE_NOM}`;
      case 'User.PasswordTooShort':
      case 'User.PasswordTooLong':
        return `Mot de passe invalide. ${REGLE_MOT_DE_PASSE}`;
      default:
        return e instanceof HttpErrorResponse && e.status >= 400 && e.status < 500
          ? 'Les informations saisies sont invalides.'
          : "L'inscription a échoué, réessayez plus tard.";
    }
  }
}
