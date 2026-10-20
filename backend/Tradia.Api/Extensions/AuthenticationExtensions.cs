using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Tradia.Application.Dtos;

namespace Tradia.Api.Extensions
{
    /// <summary>
    /// Ouvre la session d'un utilisateur dans le navigateur, et la relit. Ces opérations ont
    /// besoin de la requête HTTP en cours : elles restent donc dans l'API, comme
    /// <see cref="ErrorExtensions"/>.
    /// </summary>
    public static class AuthenticationExtensions
    {
        /// <summary>
        /// Connecte l'utilisateur : dépose le cookie de session, qui survit à la fermeture
        /// du navigateur. Sa durée et son renouvellement sont réglés dans <c>Program.cs</c>.
        /// </summary>
        /// <param name="httpContext">La requête en cours, dont la réponse portera le cookie.</param>
        /// <param name="user">L'utilisateur identifié par le cas d'usage de connexion.</param>
        /// <returns>Une tâche représentant l'opération asynchrone.</returns>
        public static Task SignInUserAsync(this HttpContext httpContext, AuthenticatedUserDto user)
        {
            ClaimsIdentity identity = new ClaimsIdentity(
                new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString(CultureInfo.InvariantCulture)),
                    new Claim(ClaimTypes.Name, user.Username)
                },
                CookieAuthenticationDefaults.AuthenticationScheme);

            return httpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity),
                new AuthenticationProperties { IsPersistent = true });
        }

        /// <summary>
        /// Relit l'utilisateur connecté dans le cookie de session. C'est la contrepartie de
        /// <see cref="SignInUserAsync"/> : les deux vivent ensemble pour rester d'accord sur
        /// les informations que porte le cookie.
        /// </summary>
        /// <param name="principal">L'identité de la requête en cours.</param>
        /// <returns>
        /// L'utilisateur connecté, ou <c>null</c> si personne n'est connecté ou si le cookie
        /// ne porte pas les informations attendues.
        /// </returns>
        public static AuthenticatedUserDto? GetAuthenticatedUser(this ClaimsPrincipal principal)
        {
            string? id = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            string? username = principal.FindFirstValue(ClaimTypes.Name);

            if (!int.TryParse(id, NumberStyles.None, CultureInfo.InvariantCulture, out int userId) || string.IsNullOrEmpty(username))
            {
                return null;
            }

            return new AuthenticatedUserDto { Id = userId, Username = username };
        }
    }
}
