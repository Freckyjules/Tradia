using Tradia.Application.Common;
using Tradia.Application.Dtos;

namespace Tradia.Application.Interfaces
{
    /// <summary>
    /// Interface pour le service utilisateur.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Enregistre un nouvel utilisateur.
        /// </summary>
        /// <param name="request">Les informations de l'utilisateur à enregistrer.</param>
        /// <returns>
        /// Une réussite, ou un échec portant l'une des erreurs de
        /// <see cref="Users.UserErrors"/> : mot de passe trop court, nom
        /// d'utilisateur invalide ou déjà pris.
        /// </returns>
        Task<Result> RegisterUserAsync(RegisterRequestDto request);

        /// <summary>
        /// Vérifie les identifiants d'un utilisateur. Les majuscules du nom sont ignorées.
        /// </summary>
        /// <param name="request">Le nom d'utilisateur et le mot de passe saisis.</param>
        /// <returns>
        /// L'utilisateur identifié, ou un échec <see cref="Users.UserErrors.InvalidCredentials"/>
        /// qui ne dit pas lequel du nom ou du mot de passe est faux.
        /// </returns>
        Task<Result<AuthenticatedUserDto>> LoginAsync(LoginRequestDto request);
    }
}
