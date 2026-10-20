using System.Net;
using System.Net.Http.Json;

namespace Tradia.IntegrationTests.Controllers
{
    /// <summary>
    /// Éprouve <c>POST api/user/logout</c> de bout en bout : requête HTTP réelle et cookie
    /// de session. Un test par critère de l'US-3.3 (se déconnecter).
    /// </summary>
    /// <remarks>
    /// Chaque test crée son propre compte avec un nom inédit, pour ne jamais dépendre
    /// de ce qu'un autre test a créé. Le client garde les cookies, comme un navigateur.
    /// </remarks>
    public class UserControllerLogoutTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private const string RouteInscription = "/api/user/register";
        private const string RouteConnexion = "/api/user/login";
        private const string RouteDeconnexion = "/api/user/logout";
        private const string RouteMoi = "/api/user/me";
        private const string MotDePasseValide = "motdepasse1";

        private readonly HttpClient client;

        /// <summary>
        /// Initialise les tests avec l'API partagée.
        /// </summary>
        /// <param name="api">L'API démarrée sur sa base en mémoire.</param>
        public UserControllerLogoutTests(CustomWebApplicationFactory<Program> api)
        {
            client = api.CreateClient();
        }

        /// <summary>
        /// Un utilisateur connecté se déconnecte : 204, sans corps.
        /// </summary>
        [Fact]
        public async Task Logout_UtilisateurConnecte_Renvoie204()
        {
            await SeConnecter();

            HttpResponseMessage reponse = await Deconnecter();

            Assert.Equal(HttpStatusCode.NoContent, reponse.StatusCode);
        }

        /// <summary>
        /// Après la déconnexion, l'utilisateur redevient visiteur : <c>GET api/user/me</c> répond 401.
        /// </summary>
        [Fact]
        public async Task Logout_UtilisateurConnecte_LeRendVisiteur()
        {
            await SeConnecter();

            await Deconnecter();

            HttpResponseMessage reponse = await client.GetAsync(RouteMoi, TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.Unauthorized, reponse.StatusCode);
        }

        /// <summary>
        /// La réponse demande au navigateur d'effacer le cookie de session : il est vidé et déjà expiré.
        /// </summary>
        [Fact]
        public async Task Logout_UtilisateurConnecte_EffaceLeCookieDeSession()
        {
            await SeConnecter();

            HttpResponseMessage reponse = await Deconnecter();

            string cookie = Assert.Single(reponse.Headers.GetValues("Set-Cookie"));
            Assert.StartsWith("tradia.auth=;", cookie);
            Assert.Contains("expires=Thu, 01 Jan 1970", cookie, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Se déconnecter sans être connecté n'est pas une erreur : 204, l'utilisateur est déjà visiteur.
        /// </summary>
        [Fact]
        public async Task Logout_SansConnexion_Renvoie204()
        {
            HttpResponseMessage reponse = await Deconnecter();

            Assert.Equal(HttpStatusCode.NoContent, reponse.StatusCode);
        }

        /// <summary>
        /// Après une déconnexion, le même compte peut se reconnecter.
        /// </summary>
        [Fact]
        public async Task Logout_UtilisateurConnecte_PermetDeSeReconnecter()
        {
            string nom = await SeConnecter();
            await Deconnecter();

            HttpResponseMessage reponse = await client.PostAsJsonAsync(
                RouteConnexion,
                new { username = nom, password = MotDePasseValide },
                TestContext.Current.CancellationToken);

            Assert.Equal(HttpStatusCode.OK, reponse.StatusCode);
        }

        /// <summary>
        /// Crée un compte puis s'y connecte.
        /// </summary>
        /// <returns>Le nom d'utilisateur du compte créé.</returns>
        private async Task<string> SeConnecter()
        {
            string nom = "u" + Guid.NewGuid().ToString("N")[..12];

            HttpResponseMessage inscription = await client.PostAsJsonAsync(
                RouteInscription,
                new { username = nom, password = MotDePasseValide },
                TestContext.Current.CancellationToken);
            inscription.EnsureSuccessStatusCode();

            HttpResponseMessage connexion = await client.PostAsJsonAsync(
                RouteConnexion,
                new { username = nom, password = MotDePasseValide },
                TestContext.Current.CancellationToken);
            connexion.EnsureSuccessStatusCode();

            return nom;
        }

        /// <summary>
        /// Envoie une demande de déconnexion.
        /// </summary>
        /// <returns>La réponse de l'API.</returns>
        private Task<HttpResponseMessage> Deconnecter()
        {
            return client.PostAsync(RouteDeconnexion, null, TestContext.Current.CancellationToken);
        }
    }
}
