import { TestBed } from '@angular/core/testing';
import { Navigation, Router, provideRouter } from '@angular/router';
import { MESSAGE_COMPTE_CREE } from '../inscription-page/inscription-page';
import { ConnexionPage } from './connexion-page';

describe('ConnexionPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  /** Crée la page, la navigation en cours portant (ou non) l'état donné. */
  function afficher(state?: { message: string }) {
    const navigation = state ? ({ extras: { state } } as unknown as Navigation) : null;
    vi.spyOn(TestBed.inject(Router), 'currentNavigation').mockReturnValue(navigation);

    const fixture = TestBed.createComponent(ConnexionPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("affiche le message transmis par l'inscription", () => {
    const racine = afficher({ message: MESSAGE_COMPTE_CREE });

    expect(racine.querySelector('[role="status"]')?.textContent).toContain(MESSAGE_COMPTE_CREE);
  });

  it("n'affiche pas de message sans navigation depuis l'inscription", () => {
    const racine = afficher();

    expect(racine.querySelector('[role="status"]')).toBeNull();
  });
});
