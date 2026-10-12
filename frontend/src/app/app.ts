import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnTete } from './core/layout/en-tete/en-tete';

/**
 * Coquille du site : l'en-tête, puis la page de la route courante.
 */
@Component({
  imports: [RouterOutlet, EnTete],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
