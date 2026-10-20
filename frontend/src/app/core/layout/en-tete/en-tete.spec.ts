import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { Session } from '../../auth/session';
import { EnTete } from './en-tete';

describe('EnTete', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EnTete],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  /** Crée l'en-tête et rend son texte et ses liens. */
  async function afficher() {
    const fixture = TestBed.createComponent(EnTete);
    await fixture.whenStable();
    const racine = fixture.nativeElement as HTMLElement;
    const liens = Array.from(racine.querySelectorAll('a')).map((a) => a.textContent?.trim());
    return { fixture, racine, liens };
  }

  /** Trouve le bouton « Se déconnecter », s'il est affiché. */
  function boutonDeDeconnexion(racine: HTMLElement) {
    return racine.querySelector<HTMLButtonElement>('button.deconnexion');
  }

  it("propose de se connecter ou de créer un compte quand personne n'est connecté", async () => {
    const { racine, liens } = await afficher();

    expect(liens).toContain('Se connecter');
    expect(liens).toContain('Créer un compte');
    expect(racine.textContent).not.toContain('Connecté :');
    expect(boutonDeDeconnexion(racine)).toBeNull();
  });

  it("le lien « Se connecter » ramène à la page où l'on était", async () => {
    const { racine } = await afficher();

    const lien = Array.from(racine.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'Se connecter',
    );

    expect(lien?.getAttribute('href')).toBe('/compte/connexion?returnUrl=%2F');
  });

  it("affiche le nom de l'utilisateur connecté, sans lien de connexion", async () => {
    TestBed.inject(Session).definir({ username: 'jules' });

    const { racine, liens } = await afficher();

    expect(racine.textContent).toContain('Connecté : jules');
    expect(liens).not.toContain('Se connecter');
    expect(liens).not.toContain('Créer un compte');
  });

  it("propose de se déconnecter à l'utilisateur connecté", async () => {
    TestBed.inject(Session).definir({ username: 'jules' });

    const { racine } = await afficher();

    expect(boutonDeDeconnexion(racine)?.textContent?.trim()).toBe('Se déconnecter');
  });

  it("déconnecte l'utilisateur, puis l'envoie sur la page de connexion", async () => {
    const session = TestBed.inject(Session);
    session.definir({ username: 'jules' });
    const { fixture, racine } = await afficher();

    boutonDeDeconnexion(racine)!.click();
    http.expectOne('/api/user/logout').flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(session.utilisateur()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/compte/connexion');
    expect(racine.textContent).not.toContain('Connecté :');
  });

  it("dit que la déconnexion a échoué, et garde l'utilisateur connecté", async () => {
    const session = TestBed.inject(Session);
    session.definir({ username: 'jules' });
    const { fixture, racine } = await afficher();

    boutonDeDeconnexion(racine)!.click();
    http.expectOne('/api/user/logout').error(new ProgressEvent('error'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(racine.querySelector('[role="alert"]')?.textContent).toContain('La déconnexion a échoué');
    expect(session.utilisateur()).toEqual({ username: 'jules' });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it("n'envoie pas une seconde demande pendant qu'une première est en cours", async () => {
    TestBed.inject(Session).definir({ username: 'jules' });
    const { racine } = await afficher();

    boutonDeDeconnexion(racine)!.click();
    boutonDeDeconnexion(racine)!.click();

    http.expectOne('/api/user/logout');
  });
});
