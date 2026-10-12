using System.Net;

namespace Tradia.IntegrationTests
{
    /// <summary>
    /// Éprouve <c>GET api/health</c>, l'endpoint que le front appelle pour vérifier
    /// qu'il joint l'API.
    /// </summary>
    public class HealthTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient client;

        /// <summary>
        /// Initialise les tests avec l'API partagée.
        /// </summary>
        /// <param name="api">L'API démarrée sur sa base en mémoire.</param>
        public HealthTests(CustomWebApplicationFactory<Program> api)
        {
            client = api.CreateClient();
        }

        /// <summary>
        /// L'API démarrée répond 200 et « Healthy ».
        /// </summary>
        [Fact]
        public async Task Health_ApiDemarree_Renvoie200EtHealthy()
        {
            HttpResponseMessage reponse = await client.GetAsync("/api/health", TestContext.Current.CancellationToken);

            Assert.Equal(HttpStatusCode.OK, reponse.StatusCode);
            Assert.Equal("Healthy", await reponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        }
    }
}
