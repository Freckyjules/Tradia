import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("affiche l'en-tête et la zone de contenu", async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('app-en-tete')).toBeTruthy();
    expect(page.querySelector('main router-outlet')).toBeTruthy();
  });
});
