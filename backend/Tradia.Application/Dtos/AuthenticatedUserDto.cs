namespace Tradia.Application.Dtos
{
    /// <summary>
    /// Dto de l'utilisateur connecté : ce que l'API révèle de lui, jamais son mot de passe.
    /// </summary>
    public class AuthenticatedUserDto
    {
        /// <summary>
        /// Identifiant unique de l'utilisateur.
        /// </summary>
        public required int Id { get; set; }

        /// <summary>
        /// Nom d'utilisateur, tel qu'il a été saisi à l'inscription.
        /// </summary>
        public required string Username { get; set; }
    }
}
