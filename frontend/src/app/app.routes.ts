import { Routes } from '@angular/router';

/**
 * Une route par feature, chargée à la demande : le code d'une partie du site
 * n'est téléchargé que lorsqu'on l'ouvre. Chaque feature ajoute la sienne avec
 * sa première US.
 */
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/accueil/accueil.routes').then((m) => m.ACCUEIL_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
