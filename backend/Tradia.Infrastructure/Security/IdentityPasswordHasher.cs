using Microsoft.AspNetCore.Identity;
using Tradia.Application.Interfaces;

namespace Tradia.Infrastructure.Security
{
    /// <summary>
    /// Implémentation du service de hachage des mots de passe.
    /// </summary>
    public class IdentityPasswordHasher : IPasswordHasher
    {
        private readonly PasswordHasher<object> inner;

        /// <summary>
        /// Hash d'un mot de passe jeté, calculé une fois : sert à vérifier un mot de passe
        /// quand le compte n'existe pas, pour que le temps de réponse reste le même.
        /// </summary>
        private readonly string dummyHash;

        /// <summary>
        /// Initialise le service sur le hacheur d'ASP.NET Core Identity.
        /// </summary>
        public IdentityPasswordHasher()
        {
            inner = new PasswordHasher<object>();
            dummyHash = inner.HashPassword(user: null!, Guid.NewGuid().ToString("N"));
        }

        /// <inheritdoc />
        public string HashPassword(string password)
        {
            return inner.HashPassword(user: null!, password);
        }

        /// <inheritdoc />
        public bool VerifyPassword(string passwordHash, string password)
        {
            PasswordVerificationResult result = inner.VerifyHashedPassword(user: null!, passwordHash, password);
            return result != PasswordVerificationResult.Failed;
        }

        /// <inheritdoc />
        public void SimulateVerification(string password)
        {
            inner.VerifyHashedPassword(user: null!, dummyHash, password);
        }
    }
}
