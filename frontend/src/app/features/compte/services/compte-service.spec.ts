import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompteService } from './compte-service';

describe('CompteService', () => {
  let http: HttpTestingController;
  let service: CompteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CompteService);
  });

  afterEach(() => http.verify());

  it('appelle POST /api/user/register avec le nom et le mot de passe', () => {
    service.inscrire({ username: 'jules', password: 'motdepasse' }).subscribe();

    const requete = http.expectOne('/api/user/register');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({ username: 'jules', password: 'motdepasse' });
    requete.flush(null, { status: 201, statusText: 'Created' });
  });

  it("appelle POST /api/user/login et rend l'utilisateur connecté", () => {
    let utilisateur: unknown;
    service.connecter({ username: 'jules', password: 'motdepasse' }).subscribe((u) => (utilisateur = u));

    const requete = http.expectOne('/api/user/login');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({ username: 'jules', password: 'motdepasse' });
    requete.flush({ username: 'jules' });

    expect(utilisateur).toEqual({ username: 'jules' });
  });
});
