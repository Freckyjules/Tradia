import { Routes } from '@angular/router';
import { ConnexionPage } from './pages/connexion-page/connexion-page';
import { InscriptionPage } from './pages/inscription-page/inscription-page';

export const COMPTE_ROUTES: Routes = [
  { path: 'inscription', component: InscriptionPage, title: 'Créer un compte — Tradia' },
  { path: 'connexion', component: ConnexionPage, title: 'Connexion — Tradia' },
  { path: '**', redirectTo: 'inscription' },
];
