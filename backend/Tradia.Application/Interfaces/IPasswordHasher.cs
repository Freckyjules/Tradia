namespace Tradia.Application.Interfaces
{
    /// <summary>
    /// Interface pour le service de hachage des mots de passe.
    /// </summary>
    public interface IPasswordHasher
    {
        /// <summary>
        /// Hache le mot de passe
        /// </summary>
        /// <param name="password">Le mot de passe à hacher</param>
        /// <returns>Le mot de passe haché</returns>
        string HashPassword(string password);

        /// <summary>
        /// Vérifie qu'un mot de passe correspond à un hash.
        /// </summary>
        /// <param name="passwordHash">Le hash enregistré.</param>
        /// <param name="password">Le mot de passe saisi.</param>
        /// <returns><c>true</c> si le mot de passe correspond au hash.</returns>
        bool VerifyPassword(string passwordHash, string password);

        /// <summary>
        /// Dépense le même temps qu'une vraie vérification, sans rien vérifier. À appeler
        /// quand le compte n'existe pas, pour que la durée de la réponse ne révèle pas
        /// si le nom d'utilisateur est connu.
        /// </summary>
        /// <param name="password">Le mot de passe saisi.</param>
        void SimulateVerification(string password);
    }
}
