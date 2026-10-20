import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Session } from '../auth/session';
import { intercepteurSessionExpiree } from './intercepteur-session-expiree';

describe('intercepteurSessionExpiree', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let session: Session;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([intercepteurSessionExpiree])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    session = TestBed.inject(Session);
    session.definir({ username: 'jules' });
  });

  afterEach(() => http.verify());

  it("oublie l'utilisateur quand l'API répond 401", () => {
    client.get('/api/mangas').subscribe({ error: () => undefined });

    http.expectOne('/api/mangas').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(session.utilisateur()).toBeNull();
  });

  it("garde l'utilisateur quand l'API répond une autre erreur", () => {
    client.get('/api/mangas').subscribe({ error: () => undefined });

    http.expectOne('/api/mangas').flush(null, { status: 500, statusText: 'Server Error' });

    expect(session.utilisateur()).toEqual({ username: 'jules' });
  });

  it("garde l'utilisateur quand la requête réussit", () => {
    client.get('/api/mangas').subscribe();

    http.expectOne('/api/mangas').flush([]);

    expect(session.utilisateur()).toEqual({ username: 'jules' });
  });
});
