import { HttpErrorResponse } from '@angular/common/http';
import { lireCodeErreur } from './probleme-api';

describe('lireCodeErreur', () => {
  it('renvoie le code d\'un ProblemDetails', () => {
    const erreur = new HttpErrorResponse({ status: 409, error: { code: 'User.UsernameTaken' } });

    expect(lireCodeErreur(erreur)).toBe('User.UsernameTaken');
  });

  it("renvoie undefined quand le corps n'a pas de code", () => {
    const erreur = new HttpErrorResponse({ status: 400, error: { title: 'Bad Request' } });

    expect(lireCodeErreur(erreur)).toBeUndefined();
  });

  it('renvoie undefined quand le corps est vide', () => {
    expect(lireCodeErreur(new HttpErrorResponse({ status: 0, error: null }))).toBeUndefined();
  });

  it("renvoie undefined quand le code n'est pas un texte", () => {
    const erreur = new HttpErrorResponse({ status: 400, error: { code: 42 } });

    expect(lireCodeErreur(erreur)).toBeUndefined();
  });

  it("renvoie undefined quand l'erreur n'est pas une erreur HTTP", () => {
    expect(lireCodeErreur(new Error('boom'))).toBeUndefined();
  });
});
