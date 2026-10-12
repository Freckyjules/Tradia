import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EtatApi } from '../../../../core/api/etat-api';

/**
 * Page d'accueil. Pour l'instant, elle indique seulement si le front joint l'API ;
 * les rubriques et la bibliothèque viendront avec l'epic E5.
 */
@Component({
  selector: 'app-accueil-page',
  templateUrl: './accueil-page.html',
  styleUrl: './accueil-page.scss',
})
export class AccueilPage {
  private readonly etatApi = inject(EtatApi);

  /** `undefined` pendant la vérification, puis `true` ou `false`. */
  protected readonly apiJointe = toSignal(this.etatApi.verifier());
}
