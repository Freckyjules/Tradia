using System.ComponentModel.DataAnnotations;

namespace Tradia.Application.Dtos
{
    /// <summary>
    /// Dto pour la requête de connexion d'un utilisateur.
    /// </summary>
    public class LoginRequestDto
    {
        /// <summary>
        /// Nom d'utilisateur. Les majuscules sont ignorées.
        /// </summary>
        [Required]
        public required string Username { get; set; }

        /// <summary>
        /// Mot de passe.
        /// </summary>
        [Required]
        public required string Password { get; set; }
    }
}
