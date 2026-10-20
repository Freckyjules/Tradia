using Microsoft.EntityFrameworkCore;
using Tradia.Domain.Entities;

namespace Tradia.Infrastructure.Data
{
    /// <summary>
    /// Contexte EF Core de Tradia : les tables de la base et leur configuration.
    /// </summary>
    public class TradiaDbContext : DbContext
    {
        /// <summary>Table des utilisateurs.</summary>
        public DbSet<User> Users => Set<User>();

        /// <summary>
        /// Initialise le contexte avec ses options (fournisseur et chaîne de connexion),
        /// données par l'injection de dépendances.
        /// </summary>
        /// <param name="options">Les options du contexte.</param>
        public TradiaDbContext(DbContextOptions<TradiaDbContext> options)
            : base(options)
        {
        }

        /// <inheritdoc />
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Username).IsRequired().HasMaxLength(20);
                entity.Property(u => u.NormalizedUsername).IsRequired().HasMaxLength(20);
                entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(200);

                // L'unicité porte sur le nom normalisé : « jules » et « Jules » ne
                // peuvent pas coexister, même inscrits au même instant.
                entity.HasIndex(u => u.NormalizedUsername).IsUnique();
            });
        }
    }
}
