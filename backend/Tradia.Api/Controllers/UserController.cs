using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tradia.Api.Extensions;
using Tradia.Application.Common;
using Tradia.Application.Dtos;
using Tradia.Application.Interfaces;

namespace Tradia.Api.Controllers
{
    /// <summary>Point d'entrée d'authentification.</summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class UserController : ControllerBase
    {
        private readonly IUserService userService;

        /// <summary>Injecte le service utilisateur.</summary>
        /// <param name="userService">Le service portant les cas d'usage utilisateur.</param>
        public UserController(IUserService userService)
        {
            this.userService = userService;
        }

        /// <summary>
        /// Enregistre un nouvel utilisateur.
        /// </summary>
        /// <param name="request"> Le nom d'utilisateur et le mot de passe. </param>
        /// <returns>
        /// 201 si le compte est créé, 400 si une règle n'est pas respectée,
        /// 409 si le nom d'utilisateur est déjà pris.
        /// </returns>
        [HttpPost("register")]
        [EndpointSummary("Enregistre un nouvel utilisateur.")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            Result result = await userService.RegisterUserAsync(request);

            if (result.IsFailure)
            {
                return this.ToProblem(result.Error);
            }

            return StatusCode(StatusCodes.Status201Created);
        }

        /// <summary>
        /// Connecte un utilisateur : l'API dépose un cookie de session qui dure 30 jours,
        /// renouvelé à chaque visite, et qui survit à la fermeture du navigateur.
        /// </summary>
        /// <param name="request"> Le nom d'utilisateur (majuscules ignorées) et le mot de passe. </param>
        /// <returns>
        /// 200 avec l'utilisateur connecté, 400 si un champ manque, 401 si le nom
        /// d'utilisateur ou le mot de passe est incorrect.
        /// </returns>
        [HttpPost("login")]
        [EndpointSummary("Connecte un utilisateur.")]
        [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            Result<AuthenticatedUserDto> result = await userService.LoginAsync(request);

            if (result.IsFailure)
            {
                return this.ToProblem(result.Error);
            }

            await HttpContext.SignInUserAsync(result.Value);

            return Ok(ToResponse(result.Value));
        }

        /// <summary>
        /// Déconnecte l'utilisateur : le cookie de session est effacé, et il redevient visiteur.
        /// Sans effet, mais sans erreur, si personne n'est connecté.
        /// </summary>
        /// <returns> 204, que l'utilisateur ait été connecté ou non. </returns>
        [HttpPost("logout")]
        [EndpointSummary("Déconnecte l'utilisateur.")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutUserAsync();

            return NoContent();
        }

        /// <summary>
        /// Rend l'utilisateur actuellement connecté : c'est ainsi que le front sait,
        /// au chargement de la page, si la session est toujours ouverte.
        /// </summary>
        /// <returns> 200 avec l'utilisateur connecté, 401 si personne n'est connecté. </returns>
        [HttpGet("me")]
        [Authorize]
        [EndpointSummary("Rend l'utilisateur connecté.")]
        [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Me()
        {
            AuthenticatedUserDto? user = User.GetAuthenticatedUser();

            if (user is null)
            {
                return Unauthorized();
            }

            return Ok(ToResponse(user));
        }

        /// <summary>
        /// Ne garde de l'utilisateur que ce que l'API révèle : son nom, jamais son identifiant.
        /// </summary>
        /// <param name="user">L'utilisateur connecté.</param>
        /// <returns>La réponse à renvoyer au client.</returns>
        private static UserResponseDto ToResponse(AuthenticatedUserDto user)
        {
            return new UserResponseDto { Username = user.Username };
        }
    }
}
