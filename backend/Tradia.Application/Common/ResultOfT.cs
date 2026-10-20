namespace Tradia.Application.Common
{
    /// <summary>
    /// Issue d'un cas d'usage qui rend une valeur : une réussite portant cette valeur,
    /// ou un échec portant une <see cref="Common.Error"/>.
    /// </summary>
    /// <typeparam name="T">Le type de la valeur rendue en cas de réussite.</typeparam>
    public class Result<T> : Result
    {
        private readonly T? value;

        /// <summary>
        /// La valeur rendue par le cas d'usage.
        /// </summary>
        /// <exception cref="InvalidOperationException">Le résultat est un échec.</exception>
        public T Value
        {
            get
            {
                if (IsFailure)
                {
                    throw new InvalidOperationException("Un résultat en échec n'a pas de valeur.");
                }

                return value!;
            }
        }

        /// <summary>
        /// Initialise un résultat. Passer par <see cref="Success(T)"/> ou <see cref="Failure(Error)"/>.
        /// </summary>
        /// <param name="value">La valeur en cas de réussite.</param>
        /// <param name="error">L'erreur en cas d'échec, <c>null</c> en cas de réussite.</param>
        private Result(T? value, Error? error) : base(error)
        {
            this.value = value;
        }

        /// <summary>
        /// Crée un résultat réussi portant une valeur.
        /// </summary>
        /// <param name="value">La valeur rendue.</param>
        /// <returns>Le résultat réussi.</returns>
        public static Result<T> Success(T value)
        {
            return new Result<T>(value, null);
        }

        /// <summary>
        /// Crée un résultat en échec.
        /// </summary>
        /// <param name="error">L'erreur qui a fait échouer le cas d'usage.</param>
        /// <returns>Le résultat en échec.</returns>
        public static new Result<T> Failure(Error error)
        {
            return new Result<T>(default, error);
        }

        /// <summary>
        /// Convertit une valeur en résultat réussi, pour pouvoir écrire
        /// <c>return utilisateur;</c> dans un cas d'usage.
        /// </summary>
        /// <param name="value">La valeur rendue.</param>
        public static implicit operator Result<T>(T value)
        {
            return Success(value);
        }

        /// <summary>
        /// Convertit une erreur en résultat en échec, pour pouvoir écrire
        /// <c>return UserErrors.InvalidCredentials;</c> dans un cas d'usage.
        /// </summary>
        /// <param name="error">L'erreur qui a fait échouer le cas d'usage.</param>
        public static implicit operator Result<T>(Error error)
        {
            return Failure(error);
        }
    }
}
