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
        /// Initialise le service sur le hacheur d'ASP.NET Core Identity.
        /// </summary>
        public IdentityPasswordHasher()
        {
            inner = new PasswordHasher<object>();
        }

        /// <inheritdoc />
        public string HashPassword(string password)
        {
            return inner.HashPassword(user: null!, password);
        }
    }
}
