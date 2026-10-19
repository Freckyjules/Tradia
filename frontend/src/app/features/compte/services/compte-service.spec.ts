import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompteService } from './compte-service';

describe('CompteService', () => {
  it('appelle POST /api/user/register avec le nom et le mot de passe', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);

    TestBed.inject(CompteService).inscrire({ username: 'jules', password: 'motdepasse' }).subscribe();

    const requete = http.expectOne('/api/user/register');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({ username: 'jules', password: 'motdepasse' });
    requete.flush(null, { status: 201, statusText: 'Created' });
    http.verify();
  });
});
