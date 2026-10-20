import { urlDeRetourSure } from './url-de-retour';

describe('urlDeRetourSure', () => {
  it.each([
    ['/manga/3', '/manga/3'],
    ['/?page=2', '/?page=2'],
    [null, '/'],
    ['', '/'],
    ['//autre-site.com', '/'],
    ['/\\autre-site.com', '/'],
    ['https://autre-site.com', '/'],
    ['manga/3', '/'],
    ['/compte/connexion?returnUrl=%2F', '/'],
    ['/compte/inscription', '/'],
  ])('« %s » donne « %s »', (url, attendu) => {
    expect(urlDeRetourSure(url)).toBe(attendu);
  });
});
