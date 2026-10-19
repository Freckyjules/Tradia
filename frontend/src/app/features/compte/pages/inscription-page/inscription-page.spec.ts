import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { InscriptionPage, MESSAGE_COMPTE_CREE } from './inscription-page';

describe('InscriptionPage', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  /** Crée la page et remplit le formulaire. */
  function remplir(username: string, password: string) {
    const fixture = TestBed.createComponent(InscriptionPage);
    fixture.detectChanges();
    const racine = fixture.nativeElement as HTMLElement;

    const saisir = (id: string, valeur: string) => {
      const champ = racine.querySelector<HTMLInputElement>(`#${id}`)!;
      champ.value = valeur;
      champ.dispatchEvent(new Event('input'));
    };
    saisir('username', username);
    saisir('password', password);

    racine.querySelector('form')!.dispatchEvent(new Event('submit'));
    return { fixture, racine };
  }

  it("envoie l'inscription et renvoie vers la connexion avec le message", () => {
    remplir('jules', 'motdepasse');

    const requete = http.expectOne('/api/user/register');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({ username: 'jules', password: 'motdepasse' });
    requete.flush(null, { status: 201, statusText: 'Created' });

    expect(router.navigate).toHaveBeenCalledWith(['/compte/connexion'], {
      state: { message: MESSAGE_COMPTE_CREE },
    });
  });

  it.each([
    ['ju', 'motdepasse'],
    ['a'.repeat(21), 'motdepasse'],
    ['jules!', 'motdepasse'],
    ['jules', 'court'],
    ['', ''],
  ])("n'appelle pas l'API pour « %s » / « %s »", (username, password) => {
    remplir(username, password);

    http.expectNone('/api/user/register');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("n'envoie pas une seconde demande pendant qu'une première est en cours", () => {
    const { racine } = remplir('jules', 'motdepasse');

    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne('/api/user/register');
  });

  it("affiche un message d'échec quand l'API est injoignable", async () => {
    const { fixture, racine } = remplir('jules', 'motdepasse');

    http.expectOne('/api/user/register').error(new ProgressEvent('error'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(racine.querySelector('[role="alert"]')?.textContent).toContain("L'inscription a échoué");
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("affiche un message générique pour un 400 sans code", async () => {
    const { fixture, racine } = remplir('jules', 'motdepasse');

    http
      .expectOne('/api/user/register')
      .flush({ title: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(racine.querySelector('[role="alert"]')?.textContent).toContain(
      'Les informations saisies sont invalides',
    );
  });

  it("permet de réessayer après une erreur", async () => {
    const { fixture, racine } = remplir('jules', 'motdepasse');
    http.expectOne('/api/user/register').flush({ code: 'User.UsernameTaken' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    await fixture.whenStable();

    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne('/api/user/register');
  });

  it.each([
    ['User.UsernameTaken', 409, "Ce nom d'utilisateur est déjà pris"],
    ['User.InvalidUsername', 400, '3 à 20 caractères'],
    ['User.PasswordTooShort', 400, 'Au moins 8 caractères'],
  ])('affiche le message pour le code %s', async (code, status, attendu) => {
    const { fixture, racine } = remplir('jules', 'motdepasse');

    http.expectOne('/api/user/register').flush({ code }, { status, statusText: 'Erreur' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(racine.querySelector('[role="alert"]')?.textContent).toContain(attendu);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
