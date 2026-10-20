using Microsoft.EntityFrameworkCore;
using Tradia.Domain.Entities;
using Tradia.Domain.Repositories;
using Tradia.Infrastructure.Data;

namespace Tradia.Infrastructure.Repositories
{
    /// <summary>
    /// Implémentation du repository pour les utilisateurs utilisant Entity Framework <see cref="IUserRepository"/>.
    /// </summary>
    public class EfUserRepository : IUserRepository
    {
        private readonly TradiaDbContext context;

        /// <summary>
        /// Initialise le repository sur le contexte EF Core de l'application.
        /// </summary>
        /// <param name="context">Le contexte de la base Tradia.</param>
        public EfUserRepository(TradiaDbContext context)
        {
            this.context = context;
        }

        /// <inheritdoc/>
        /// <exception cref="DbUpdateException">
        /// L'enregistrement a échoué, notamment si le nom d'utilisateur est déjà pris.
        /// </exception>
        public async Task AddAsync(User user)
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
        }

        /// <inheritdoc/>
        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            // Normalisé ici, en C#, une seule fois : la base compare alors directement
            // avec l'index, sans convertir chaque ligne.
            string normalizedUsername = User.NormalizeUsername(username);

            return await context.Users.AnyAsync(u => u.NormalizedUsername == normalizedUsername);
        }

        /// <inheritdoc/>
        public async Task<User?> GetByUsernameAsync(string username)
        {
            string normalizedUsername = User.NormalizeUsername(username);

            return await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.NormalizedUsername == normalizedUsername);
        }
    }
}
