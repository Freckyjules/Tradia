using Microsoft.EntityFrameworkCore;
using Tradia.Application.Interfaces;
using Tradia.Application.Services;
using Tradia.Domain.Repositories;
using Tradia.Infrastructure.Data;
using Tradia.Infrastructure.Repositories;
using Tradia.Infrastructure.Security;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<TradiaDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Tradia")));

builder.Services.AddScoped<IUserRepository, EfUserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<IPasswordHasher, IdentityPasswordHasher>();

builder.Services.AddHealthChecks();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Crée la base au premier lancement et applique les migrations en attente.
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<TradiaDbContext>().Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Pas de redirection vers https en développement : le proxy du front appelle
// l'API en http, et une redirection vers le port https serait une autre origine,
// bloquée par le navigateur (CORS).
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

// Répond « Healthy » tant que l'API tourne : le front s'en sert pour vérifier
// qu'il la joint, et Docker pourra s'en servir plus tard (US-9.7).
app.MapHealthChecks("/api/health");

app.Run();

/// <summary>
/// Point d'entrée de l'API. Déclaré public pour que les tests d'intégration
/// puissent démarrer l'application avec <c>WebApplicationFactory&lt;Program&gt;</c>.
/// </summary>
public partial class Program
{
}
