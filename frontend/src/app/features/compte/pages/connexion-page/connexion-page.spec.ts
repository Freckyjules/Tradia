import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Navigation, Router, provideRouter } from '@angular/router';
import { Session } from '../../../../core/auth/session';
import { MESSAGE_COMPTE_CREE } from '../inscription-page/inscription-page';
import { ConnexionPage } from './connexion-page';

describe('ConnexionPage', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  /** Crée la page : `state` est l'état de navigation reçu de la page précédente. */
  function afficher(options: { state?: { message: string } } = {}) {
    vi.spyOn(router, 'currentNavigation').mockReturnValue(
      options.state ? ({ extras: { state: options.state } } as unknown as Navigation) : null,
    );

    const fixture = TestBed.createComponent(ConnexionPage);
    fixture.detectChanges();
    return { fixture, racine: fixture.nativeElement as HTMLElement };
  }

  /** Remplit le formulaire et l'envoie. */
  function saisir(racine: HTMLElement, username: string, password: string) {
    const remplir = (id: string, valeur: string) => {
      const champ = racine.querySelector<HTMLInputElement>(`#${id}`)!;
      champ.value = valeur;
      champ.dispatchEvent(new Event('input'));
    };
    remplir('username', username);
    remplir('password', password);
    racine.querySelector('form')!.dispatchEvent(new Event('submit'));
  }

  it("affiche le message transmis par l'inscription", () => {
    const { racine } = afficher({ state: { message: MESSAGE_COMPTE_CREE } });

    expect(racine.querySelector('[role="status"]')?.textContent).toContain(MESSAGE_COMPTE_CREE);
  });

  it("n'affiche pas de message sans navigation depuis l'inscription", () => {
    const { racine } = afficher();

    expect(racine.querySelector('[role="status"]')).toBeNull();
  });

  it('envoie les identifiants avec POST /api/user/login', () => {
    const { racine } = afficher();

    saisir(racine, 'jules', 'motdepasse1');

    const requete = http.expectOne('/api/user/login');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({ username: 'jules', password: 'motdepasse1' });
  });

  it("retient l'utilisateur connecté", () => {
    const { racine } = afficher();

    saisir(racine, 'jules', 'motdepasse1');
    http.expectOne('/api/user/login').flush({ username: 'jules' });

    expect(TestBed.inject(Session).utilisateur()).toEqual({ username: 'jules' });
  });

  it("envoie l'utilisateur connecté sur l'accueil, et nulle part ailleurs", () => {
    const { racine } = afficher();

    saisir(racine, 'jules', 'motdepasse1');
    http.expectOne('/api/user/login').flush({ username: 'jules' });

    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it("ne réclame rien tant que le formulaire n'a pas été envoyé", async () => {
    const { fixture, racine } = afficher();

    racine.querySelector<HTMLInputElement>('#username')!.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(racine.querySelector('[role="alert"]')).toBeNull();
  });

  it("réclame les deux champs quand le formulaire est envoyé vide", async () => {
    const { fixture, racine } = afficher();

    saisir(racine, '', '');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(racine.querySelector('[role="alert"]')?.textContent).toContain(
      "Saisissez votre nom d'utilisateur et votre mot de passe",
    );
  });

  it.each([
    ['', 'motdepasse1'],
    ['jules', ''],
    ['', ''],
  ])("n'appelle pas l'API pour « %s » / « %s »", (username, password) => {
    const { racine } = afficher();

    saisir(racine, username, password);

    http.expectNone('/api/user/login');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it("affiche le message de l'US pour des identifiants incorrects, sans dire lequel est faux", async () => {
    const { fixture, racine } = afficher();

    saisir(racine, 'jules', 'faux');
    http
      .expectOne('/api/user/login')
      .flush({ code: 'User.InvalidCredentials' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(racine.querySelector('[role="alert"]')?.textContent).toContain(
      "Nom d'utilisateur ou mot de passe incorrect",
    );
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it("affiche un message d'échec quand l'API est injoignable", async () => {
    const { fixture, racine } = afficher();

    saisir(racine, 'jules', 'motdepasse1');
    http.expectOne('/api/user/login').error(new ProgressEvent('error'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(racine.querySelector('[role="alert"]')?.textContent).toContain('La connexion a échoué');
  });

  it("n'envoie pas une seconde demande pendant qu'une première est en cours", () => {
    const { racine } = afficher();

    saisir(racine, 'jules', 'motdepasse1');
    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne('/api/user/login');
  });

  it('permet de réessayer après une erreur', async () => {
    const { fixture, racine } = afficher();
    saisir(racine, 'jules', 'faux');
    http
      .expectOne('/api/user/login')
      .flush({ code: 'User.InvalidCredentials' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    await fixture.whenStable();

    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne('/api/user/login');
  });
});
