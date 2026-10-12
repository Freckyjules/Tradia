using System.Text.RegularExpressions;
using Tradia.Application.Common;
using Tradia.Application.Dtos;
using Tradia.Application.Interfaces;
using Tradia.Application.Users;
using Tradia.Domain.Entities;
using Tradia.Domain.Repositories;

namespace Tradia.Application.Services
{
    /// <summary>
    /// Implémentation du service utilisateur.
    /// </summary>
    public class UserService : IUserService
    {
        #region Constantes

        private const int LongueurMinimaleDuMotDePasse = 8;
        private const int LongueurMaximaleDuMotDePasse = 128;

        /// <summary>
        /// De 3 à 20 caractères, uniquement des lettres non accentuées, des chiffres,
        /// « _ » et « - ». Sensible à la casse : « jules » et « Jules » sont deux comptes.
        /// </summary>
        private static readonly Regex FormatDuNomDUtilisateur = new Regex("^[A-Za-z0-9_-]{3,20}$");

        #endregion

        #region Attributs

        private readonly IPasswordHasher passwordHasher;
        private readonly IUserRepository userRepository;

        #endregion

        #region Constructeurs

        /// <summary>
        /// Initialise une nouvelle instance de la classe <see cref="UserService"/>.
        /// </summary>
        /// <param name="passwordHasher">Le service de hachage des mots de passe.</param>
        /// <param name="userRepository">Le dépôt des utilisateurs.</param>
        public UserService(IPasswordHasher passwordHasher, IUserRepository userRepository)
        {
            this.passwordHasher = passwordHasher;
            this.userRepository = userRepository;
        }

        #endregion

        #region Méthodes

        /// <inheritdoc/>
        public async Task<Result> RegisterUserAsync(RegisterRequestDto request)
        {
            if (request.Password.Length < LongueurMinimaleDuMotDePasse)
            {
                return UserErrors.PasswordTooShort;
            }

            if (request.Password.Length > LongueurMaximaleDuMotDePasse)
            {
                return UserErrors.PasswordTooLong;
            }

            if (!FormatDuNomDUtilisateur.IsMatch(request.Username))
            {
                return UserErrors.InvalidUsername;
            }

            if (await userRepository.ExistsByUsernameAsync(request.Username))
            {
                return UserErrors.UsernameTaken;
            }

            User user = new User(request.Username, passwordHasher.HashPassword(request.Password));

            await userRepository.AddAsync(user);

            return Result.Success();
        }

        #endregion
    }
}
