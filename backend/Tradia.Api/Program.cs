using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
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

// Connexion par cookie : l'API et le front sont sur la même origine (/api), et le
// navigateur renvoie le cookie tout seul. HttpOnly le rend illisible par le JavaScript.
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "tradia.auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;

        // En http (développement, tests), un cookie « Secure » ne serait jamais renvoyé.
        options.Cookie.SecurePolicy = builder.Environment.IsProduction()
            ? CookieSecurePolicy.Always
            : CookieSecurePolicy.SameAsRequest;

        // Rester connecté : 30 jours, repoussés à chaque visite.
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
        options.SlidingExpiration = true;

        // Une API répond par un code d'erreur : jamais par une redirection vers une page de connexion.
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

// Les clés qui signent le cookie doivent survivre à un redémarrage du conteneur, sinon
// tout le monde serait déconnecté à chaque mise à jour. Le dossier est donné en production.
string? dataProtectionKeysPath = builder.Configuration["DataProtection:KeysPath"];
if (!string.IsNullOrWhiteSpace(dataProtectionKeysPath))
{
    builder.Services.AddDataProtection()
        .SetApplicationName("Tradia")
        .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath));
}

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

    // Page de test des routes, à la racine du site, qui lit la description OpenAPI ci-dessus.
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Tradia API v1");
        options.RoutePrefix = string.Empty;
    });
}

// Pas de redirection vers https en développement : le proxy du front appelle
// l'API en http, et une redirection vers le port https serait une autre origine,
// bloquée par le navigateur (CORS).
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
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
