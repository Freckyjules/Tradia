import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/**
 * Page de connexion. Pour l'instant elle n'affiche que le message de confirmation
 * venant de l'inscription ; le formulaire viendra avec l'US-3.2.
 */
@Component({
  selector: 'app-connexion-page',
  imports: [RouterLink],
  templateUrl: './connexion-page.html',
  styleUrl: './connexion-page.scss',
})
export class ConnexionPage {
  /** Message transmis par la page précédente (état de navigation), s'il y en a un. */
  protected readonly message: string | undefined = (
    inject(Router).currentNavigation()?.extras.state as { message?: string } | undefined
  )?.message;
}
