using Tradia.Application.Common;

namespace Tradia.Application.Users
{
    /// <summary>
    /// Catalogue des erreurs prévues des cas d'usage utilisateur.
    /// </summary>
    public static class UserErrors
    {
        /// <summary>
        /// Le mot de passe est trop court.
        /// </summary>
        public static readonly Error PasswordTooShort = Error.Validation(
            "User.PasswordTooShort",
            "Le mot de passe doit contenir au moins 8 caractères.");

        /// <summary>
        /// Le nom d'utilisateur ne respecte pas la longueur ou les caractères autorisés.
        /// </summary>
        public static readonly Error InvalidUsername = Error.Validation(
            "User.InvalidUsername",
            "Le nom d'utilisateur doit faire de 3 à 20 caractères : lettres, chiffres, « _ » ou « - ».");

        /// <summary>
        /// Un compte porte déjà ce nom d'utilisateur.
        /// </summary>
        public static readonly Error UsernameTaken = Error.Conflict(
            "User.UsernameTaken",
            "Ce nom d'utilisateur est déjà pris.");

        /// <summary>
        /// Le mot de passe est trop long.
        /// </summary>
        public static readonly Error PasswordTooLong = Error.Validation(
            "User.PasswordTooLong",
            "Le mot de passe ne doit pas dépasser 128 caractères.");

        /// <summary>
        /// Le nom d'utilisateur ou le mot de passe est incorrect. Un seul message pour
        /// les deux cas : il ne doit pas révéler lequel des deux est faux.
        /// </summary>
        public static readonly Error InvalidCredentials = Error.Unauthorized(
            "User.InvalidCredentials",
            "Nom d'utilisateur ou mot de passe incorrect");
    }
}
