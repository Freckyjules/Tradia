import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Session } from '../../auth/session';
import { EnTete } from './en-tete';

describe('EnTete', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EnTete],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  /** Crée l'en-tête et rend son texte et ses liens. */
  async function afficher() {
    const fixture = TestBed.createComponent(EnTete);
    await fixture.whenStable();
    const racine = fixture.nativeElement as HTMLElement;
    const liens = Array.from(racine.querySelectorAll('a')).map((a) => a.textContent?.trim());
    return { fixture, racine, liens };
  }

  it('propose de se connecter ou de créer un compte quand personne n\'est connecté', async () => {
    const { racine, liens } = await afficher();

    expect(liens).toContain('Se connecter');
    expect(liens).toContain('Créer un compte');
    expect(racine.textContent).not.toContain('Connecté :');
  });

  it("le lien « Se connecter » ramène à la page où l'on était", async () => {
    const { racine } = await afficher();

    const lien = Array.from(racine.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'Se connecter',
    );

    expect(lien?.getAttribute('href')).toBe('/compte/connexion?returnUrl=%2F');
  });

  it('affiche le nom de l\'utilisateur connecté, sans lien de connexion', async () => {
    TestBed.inject(Session).definir({ username: 'jules' });

    const { racine, liens } = await afficher();

    expect(racine.textContent).toContain('Connecté : jules');
    expect(liens).not.toContain('Se connecter');
    expect(liens).not.toContain('Créer un compte');
  });
});
