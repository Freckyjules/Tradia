using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Tradia.IntegrationTests.Controllers
{
    /// <summary>
    /// Éprouve <c>POST api/user/login</c> et <c>GET api/user/me</c> de bout en bout :
    /// requête HTTP réelle, cookie de session, service, repository et base SQLite.
    /// Un test par critère de l'US-3.2 (se connecter).
    /// </summary>
    /// <remarks>
    /// Chaque test crée son propre compte avec un nom inédit, pour ne jamais dépendre
    /// de ce qu'un autre test a créé. Le client garde les cookies, comme un navigateur.
    /// </remarks>
    public class UserControllerLoginTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private const string RouteInscription = "/api/user/register";
        private const string RouteConnexion = "/api/user/login";
        private const string RouteMoi = "/api/user/me";
        private const string MotDePasseValide = "motdepasse1";

        private readonly HttpClient client;

        /// <summary>
        /// Initialise les tests avec l'API partagée.
        /// </summary>
        /// <param name="api">L'API démarrée sur sa base en mémoire.</param>
        public UserControllerLoginTests(CustomWebApplicationFactory<Program> api)
        {
            client = api.CreateClient();
        }

        /// <summary>
        /// Des identifiants corrects connectent l'utilisateur : 200, avec son nom tel
        /// qu'il l'a saisi à l'inscription.
        /// </summary>
        [Fact]
        public async Task Login_IdentifiantsCorrects_Renvoie200AvecLUtilisateur()
        {
            string nom = await CreerCompte("Jules" + Guid.NewGuid().ToString("N")[..6]);

            HttpResponseMessage reponse = await Connecter(nom, MotDePasseValide);

            Assert.Equal(HttpStatusCode.OK, reponse.StatusCode);
            using JsonDocument corps = await LireCorps(reponse);
            Assert.Equal(nom, corps.RootElement.GetProperty("username").GetString());
        }

        /// <summary>
        /// La réponse ne révèle que le nom : l'identifiant reste côté serveur.
        /// </summary>
        [Fact]
        public async Task Login_IdentifiantsCorrects_NeRenvoiePasLIdentifiant()
        {
            string nom = await CreerCompte(NomInedit());

            HttpResponseMessage reponse = await Connecter(nom, MotDePasseValide);

            using JsonDocument corps = await LireCorps(reponse);
            Assert.False(corps.RootElement.TryGetProperty("id", out _));
        }

        /// <summary>
        /// <c>GET api/user/me</c> ne révèle que le nom, comme la connexion.
        /// </summary>
        [Fact]
        public async Task Me_ApresConnexion_NeRenvoiePasLIdentifiant()
        {
            string nom = await CreerCompte(NomInedit());
            await Connecter(nom, MotDePasseValide);

            HttpResponseMessage reponse = await client.GetAsync(RouteMoi, TestContext.Current.CancellationToken);

            using JsonDocument corps = await LireCorps(reponse);
            Assert.False(corps.RootElement.TryGetProperty("id", out _));
        }

        /// <summary>
        /// Les majuscules du nom sont ignorées : « jules » peut se connecter en écrivant « JULES ».
        /// </summary>
        [Fact]
        public async Task Login_NomAvecAutresMajuscules_Renvoie200()
        {
            string nom = await CreerCompte("u" + Guid.NewGuid().ToString("N")[..12]);

            HttpResponseMessage reponse = await Connecter(nom.ToUpperInvariant(), MotDePasseValide);

            Assert.Equal(HttpStatusCode.OK, reponse.StatusCode);
        }

        /// <summary>
        /// Un mot de passe faux est refusé : 401, avec le code <c>User.InvalidCredentials</c>.
        /// </summary>
        [Fact]
        public async Task Login_MotDePasseFaux_Renvoie401()
        {
            string nom = await CreerCompte(NomInedit());

            HttpResponseMessage reponse = await Connecter(nom, "mauvaismdp1");

            Assert.Equal(HttpStatusCode.Unauthorized, reponse.StatusCode);
            using JsonDocument corps = await LireCorps(reponse);
            Assert.Equal("User.InvalidCredentials", corps.RootElement.GetProperty("code").GetString());
        }

        /// <summary>
        /// Un nom inconnu reçoit exactement la même réponse qu'un mot de passe faux :
        /// rien ne dit lequel des deux est incorrect.
        /// </summary>
        [Fact]
        public async Task Login_NomInconnu_RenvoieLaMemeReponseQueMotDePasseFaux()
        {
            string nom = await CreerCompte(NomInedit());

            HttpResponseMessage motDePasseFaux = await Connecter(nom, "mauvaismdp1");
            HttpResponseMessage nomInconnu = await Connecter(NomInedit(), MotDePasseValide);

            Assert.Equal(HttpStatusCode.Unauthorized, nomInconnu.StatusCode);
            Assert.Equal(
                await motDePasseFaux.Content.ReadAsStringAsync(TestContext.Current.CancellationToken),
                await nomInconnu.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        }

        /// <summary>
        /// Le message d'erreur est celui de l'US : « Nom d'utilisateur ou mot de passe incorrect ».
        /// </summary>
        [Fact]
        public async Task Login_Echec_AfficheLeMessageDeLUs()
        {
            HttpResponseMessage reponse = await Connecter(NomInedit(), MotDePasseValide);

            using JsonDocument corps = await LireCorps(reponse);
            Assert.Equal(
                "Nom d'utilisateur ou mot de passe incorrect",
                corps.RootElement.GetProperty("title").GetString());
        }

        /// <summary>
        /// Un mot de passe plus long que le maximum accepté à l'inscription est refusé sans erreur serveur.
        /// </summary>
        [Fact]
        public async Task Login_MotDePasseTropLong_Renvoie401()
        {
            string nom = await CreerCompte(NomInedit());

            HttpResponseMessage reponse = await Connecter(nom, new string('a', 129));

            Assert.Equal(HttpStatusCode.Unauthorized, reponse.StatusCode);
        }

        /// <summary>
        /// Un champ absent est refusé avant même d'atteindre le contrôleur : 400.
        /// </summary>
        [Fact]
        public async Task Login_MotDePasseAbsent_Renvoie400()
        {
            HttpResponseMessage reponse = await client.PostAsJsonAsync(
                RouteConnexion, new { username = NomInedit() }, TestContext.Current.CancellationToken);

            Assert.Equal(HttpStatusCode.BadRequest, reponse.StatusCode);
        }

        /// <summary>
        /// Une connexion réussie ne dépose un cookie qu'accessible au serveur, et qui
        /// dure au-delà de la session du navigateur (« rester connecté »).
        /// </summary>
        [Fact]
        public async Task Login_IdentifiantsCorrects_DeposeUnCookiePersistantEtHttpOnly()
        {
            string nom = await CreerCompte(NomInedit());

            HttpResponseMessage reponse = await Connecter(nom, MotDePasseValide);

            string cookie = Assert.Single(reponse.Headers.GetValues("Set-Cookie"));
            Assert.StartsWith("tradia.auth=", cookie);
            Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("expires=", cookie, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Une connexion refusée ne dépose aucun cookie.
        /// </summary>
        [Fact]
        public async Task Login_Echec_NeDeposeAucunCookie()
        {
            HttpResponseMessage reponse = await Connecter(NomInedit(), MotDePasseValide);

            Assert.False(reponse.Headers.Contains("Set-Cookie"));
        }

        /// <summary>
        /// Sans connexion, <c>GET api/user/me</c> répond 401 et non une redirection.
        /// </summary>
        [Fact]
        public async Task Me_SansConnexion_Renvoie401()
        {
            HttpResponseMessage reponse = await client.GetAsync(RouteMoi, TestContext.Current.CancellationToken);

            Assert.Equal(HttpStatusCode.Unauthorized, reponse.StatusCode);
        }

        /// <summary>
        /// Après la connexion, le cookie reçu suffit à retrouver l'utilisateur.
        /// </summary>
        [Fact]
        public async Task Me_ApresConnexion_RenvoieLUtilisateur()
        {
            string nom = await CreerCompte(NomInedit());
            await Connecter(nom, MotDePasseValide);

            HttpResponseMessage reponse = await client.GetAsync(RouteMoi, TestContext.Current.CancellationToken);

            Assert.Equal(HttpStatusCode.OK, reponse.StatusCode);
            using JsonDocument corps = await LireCorps(reponse);
            Assert.Equal(nom, corps.RootElement.GetProperty("username").GetString());
        }

        /// <summary>
        /// Crée un compte par l'API d'inscription.
        /// </summary>
        /// <param name="nom">Le nom d'utilisateur à créer.</param>
        /// <returns>Le nom, tel qu'il a été créé.</returns>
        private async Task<string> CreerCompte(string nom)
        {
            HttpResponseMessage reponse = await client.PostAsJsonAsync(
                RouteInscription,
                new { username = nom, password = MotDePasseValide },
                TestContext.Current.CancellationToken);
            reponse.EnsureSuccessStatusCode();

            return nom;
        }

        /// <summary>
        /// Envoie une demande de connexion.
        /// </summary>
        /// <param name="nom">Le nom d'utilisateur.</param>
        /// <param name="motDePasse">Le mot de passe.</param>
        /// <returns>La réponse de l'API.</returns>
        private Task<HttpResponseMessage> Connecter(string nom, string motDePasse)
        {
            return client.PostAsJsonAsync(
                RouteConnexion, new { username = nom, password = motDePasse }, TestContext.Current.CancellationToken);
        }

        /// <summary>
        /// Invente un nom d'utilisateur valide qu'aucun autre test n'utilise.
        /// </summary>
        /// <returns>Un nom de 13 caractères.</returns>
        private static string NomInedit()
        {
            return "u" + Guid.NewGuid().ToString("N")[..12];
        }

        /// <summary>
        /// Lit le corps JSON d'une réponse.
        /// </summary>
        /// <param name="reponse">La réponse de l'API.</param>
        /// <returns>Le document JSON, à libérer après usage.</returns>
        private static async Task<JsonDocument> LireCorps(HttpResponseMessage reponse)
        {
            return JsonDocument.Parse(
                await reponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        }
    }
}
