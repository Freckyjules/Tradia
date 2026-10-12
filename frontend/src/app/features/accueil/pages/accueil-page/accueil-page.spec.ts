import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccueilPage } from './accueil-page';

describe('AccueilPage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccueilPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Crée la page, laisse partir l'appel à l'API, et rend la requête interceptée. */
  function afficher() {
    const fixture = TestBed.createComponent(AccueilPage);
    fixture.detectChanges();
    return { fixture, requete: http.expectOne('/api/health') };
  }

  it('appelle GET /api/health', () => {
    const { requete } = afficher();

    expect(requete.request.method).toBe('GET');
    requete.flush('Healthy');
  });

  it("affiche « API connectée » quand l'API répond", async () => {
    const { fixture, requete } = afficher();

    requete.flush('Healthy');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API connectée');
  });

  it("affiche « API injoignable » quand l'API ne répond pas", async () => {
    const { fixture, requete } = afficher();

    requete.flush('', { status: 504, statusText: 'Gateway Timeout' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API injoignable');
  });
});
