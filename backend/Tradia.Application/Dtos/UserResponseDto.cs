namespace Tradia.Application.Dtos
{
    /// <summary>
    /// Ce que l'API révèle de l'utilisateur connecté : son nom, rien d'autre.
    /// Son identifiant reste côté serveur, dans le cookie de session.
    /// </summary>
    public class UserResponseDto
    {
        /// <summary>
        /// Nom d'utilisateur, tel qu'il a été saisi à l'inscription.
        /// </summary>
        public required string Username { get; set; }
    }
}
