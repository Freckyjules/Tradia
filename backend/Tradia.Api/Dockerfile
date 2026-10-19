# Image de l'API : une première étape compile avec le SDK .NET, la seconde ne garde
# que le runtime ASP.NET et l'application publiée (image finale légère, sans SDK).
# Le contexte de build est le dossier backend :
#   docker build -f Tradia.Api/Dockerfile .

# --- Étape 1 : compilation ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Les fichiers de projet d'abord : la restauration des paquets n'est refaite
# que si l'un d'eux change.
COPY global.json ./
COPY Tradia.Domain/Tradia.Domain.csproj Tradia.Domain/
COPY Tradia.Application/Tradia.Application.csproj Tradia.Application/
COPY Tradia.Infrastructure/Tradia.Infrastructure.csproj Tradia.Infrastructure/
COPY Tradia.Api/Tradia.Api.csproj Tradia.Api/
RUN dotnet restore Tradia.Api/Tradia.Api.csproj

COPY Tradia.Domain/ Tradia.Domain/
COPY Tradia.Application/ Tradia.Application/
COPY Tradia.Infrastructure/ Tradia.Infrastructure/
COPY Tradia.Api/ Tradia.Api/
RUN dotnet publish Tradia.Api/Tradia.Api.csproj -c Release -o /app --no-restore

# --- Étape 2 : exécution ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .

# La base SQLite vit dans /data, un volume : elle survit au remplacement du conteneur.
RUN mkdir /data && chown app /data
VOLUME /data
ENV ConnectionStrings__Tradia="Data Source=/data/tradia.db"

# Sans droits root (utilisateur « app » de l'image), port 8080.
USER app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Tradia.Api.dll"]
