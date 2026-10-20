/**
 * Garde l'adresse où renvoyer l'utilisateur après sa connexion, seulement si elle reste
 * sur ce site : une adresse comme `//autre-site.com` ou `https://…` renverrait l'utilisateur
 * ailleurs, après qu'il a saisi ses identifiants.
 *
 * Les pages du compte (`/compte/…`) sont refusées aussi : revenir sur la connexion ou sur
 * l'inscription une fois connecté n'aurait pas de sens.
 *
 * @returns l'adresse demandée si elle est sûre, sinon l'accueil (`/`).
 */
export function urlDeRetourSure(url: string | null): string {
  const estLocale = url !== null && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
  const estPageDuCompte = url !== null && url.startsWith('/compte');

  return estLocale && !estPageDuCompte ? url : '/';
}
