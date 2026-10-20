# Conventions de code C#

Ce dossier ne contient que du C#. Ces règles s'appliquent à **toutes les classes écrites ici** (entités, managers, etc.).

1. **Nommage** : le champ privé (l'attribut) en `camelCase` **minuscule**, la propriété publique en `PascalCase` **majuscule**.
2. **Initialisation dans le constructeur** : déclarer les champs nus (`private string name;`) et les initialiser dans le **constructeur**, jamais à la déclaration.
3. **Documentation XML** : documenter avec `/// <summary>` **uniquement les membres `public`** (classe, constructeur, propriétés, méthodes) — **pas** les champs `private`, sauf s'il s'agit d'un privé « technique » (non trivial). Pour les méthodes, mettre tout ce qu'il faut : `<summary>`, un `<param>` par paramètre (entrées), `<returns>` (sortie) et un `<exception>` par exception possible. **Toute la documentation (les `summary`) est rédigée en français.**
4. **Pas de régions** : ce projet n'utilise **pas** les `#region` (la skill `csharp-regions` ne s'applique pas, sauf demande explicite). On range simplement les membres **dans cet ordre** : constantes (`const`, `static readonly`), attributs, propriétés, constructeurs, méthodes publiques, méthodes privées.

Exemple de référence (illustre les 4 règles) :

```csharp
/// <summary>
/// Représente un artiste.
/// </summary>
public class Artist
{
    private string name;

    /// <summary>
    /// Nom de l'artiste.
    /// </summary>
    public string Name
    {
        get { return name; }
        set { name = value; }
    }

    /// <summary>
    /// Initialise un nouvel artiste avec des valeurs par défaut.
    /// </summary>
    public Artist()
    {
        name = string.Empty;
    }
}
```
