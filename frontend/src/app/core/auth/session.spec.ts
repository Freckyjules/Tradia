import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Session } from './session';

describe('Session', () => {
  let http: HttpTestingController;
  let session: Session;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    session = TestBed.inject(Session);
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  it("n'a personne de connecté au départ", () => {
    expect(session.utilisateur()).toBeNull();
  });

  it("retrouve l'utilisateur connecté avec GET /api/user/me", async () => {
    const chargement = session.charger();

    const requete = http.expectOne('/api/user/me');
    expect(requete.request.method).toBe('GET');
    requete.flush({ username: 'jules' });
    await chargement;

    expect(session.utilisateur()).toEqual({ username: 'jules' });
  });

  it("reste déconnectée quand l'API répond 401", async () => {
    const chargement = session.charger();

    http.expectOne('/api/user/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    await chargement;

    expect(session.utilisateur()).toBeNull();
  });

  it("ne plante pas quand l'API est injoignable", async () => {
    const chargement = session.charger();

    http.expectOne('/api/user/me').error(new ProgressEvent('error'));
    await chargement;

    expect(session.utilisateur()).toBeNull();
  });

  it("n'attend pas indéfiniment une API qui ne répond pas", async () => {
    vi.useFakeTimers();
    const chargement = session.charger();
    http.expectOne('/api/user/me');

    await vi.advanceTimersByTimeAsync(3000);
    await chargement;

    expect(session.utilisateur()).toBeNull();
  });

  it("retient l'utilisateur qui vient de se connecter", () => {
    session.definir({ username: 'jules' });

    expect(session.utilisateur()).toEqual({ username: 'jules' });
  });

  it("oublie l'utilisateur quand on l'efface", () => {
    session.definir({ username: 'jules' });

    session.effacer();

    expect(session.utilisateur()).toBeNull();
  });
});
