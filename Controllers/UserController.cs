using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AspNetCore.Identity.Database;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using backend.Contexts;
using backend.Services;
using backend.Util;
using backend.Models.ExceptionDTO;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/user")]
    public class UserController : BaseController
    {

        private readonly UserManager<CustomUser> _userManager = null;
        private readonly ApplicationDbContext _dbContext;
        private readonly IEmailSender _emailSender;
        private readonly IJWTTokens _jwtTokens;

        public UserController (
            UserManager<CustomUser> userManager, 
            ApplicationDbContext dbContext, 
            IEmailSender emailSender,
            IJWTTokens jwtTokens
        ) {
            _userManager = userManager;
            _dbContext = dbContext;
            _emailSender = emailSender;
            _jwtTokens = jwtTokens;
        }

        [AllowAnonymous]
        [HttpPost("create")]
        public async Task<IActionResult> Register([FromBody] CustomUserRequest userRequest) {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newUser = CustomUser.FromCustomUserRequest(userRequest);

            var createResult = await _userManager.CreateAsync(newUser, userRequest.Password);
            if (createResult.Succeeded)
            {
                return Ok("User registered successfully.");
            }

            foreach (var error in createResult.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return BadRequest(ModelState);
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> SendResetPasswordEmail (string email, string redirectUrl)
        {
            var user = await _userManager.FindByEmailAsync(email);

            var tokenParam = (redirectUrl.Contains('?') ? "&" : "?")
                + $"token={_jwtTokens.GenerateEncodedToken(DateTime.Now.AddDays(1), user.Id)}";
            var resetUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}"
                + redirectUrl + tokenParam;

            await _emailSender.SendResetPasswordLinkAsync(user.Email, user.Name, resetUrl);

            return Ok("Reset password link sent.");
        }

        [AllowAnonymous]
        [HttpPost("save-password")]
        public async Task<IActionResult> SavePasswordByTokenAsync([FromBody] Dictionary<string, string> body)
        {
            if (!(body.TryGetValue("token", out var token) && body.TryGetValue("newPassword", out var newPassword)))
            {
                return BadRequest(new ExceptionDTO("The token or new password were not provided."));
            }

            if (!_jwtTokens.ValidateToken(token))
            {
                return Unauthorized(new ExceptionDTO("The token has expired or is invalid. "
                    + "Please try again using the \"Forgot Password?\" page."));
            }

            // userId from jwt token
            var userId = _jwtTokens.ExtractUserIdFromToken(token);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound(new ExceptionDTO("User not found."));
            }

            var resetPasswordResult = await _userManager.RemovePasswordAsync(user);
            if (resetPasswordResult.Succeeded)
            {
                resetPasswordResult = await _userManager.AddPasswordAsync(user, newPassword);
            }

            if (!resetPasswordResult.Succeeded)
            {
                return BadRequest(resetPasswordResult.Errors);
            }

            return Ok("Password saved.");
        }

        [HttpGet]
        public async Task<IActionResult> GetAccountInfo()
        {
            var user = await _userManager.GetUserAsync(User); // Fetch the full CustomUser object
            if (user == null)
            {
                return Unauthorized(); // Or handle the case where the user isn't found
            }

            // Use the CustomUser object as needed
            return Json(user.ToCustomUserDTO());
        }

        [HttpGet("journal")]
        public async Task<IActionResult> GetJournal()
        {
            var user = await GetLoggedInUser();
            await _dbContext.Entry(user).Collection(u => u.Notes).LoadAsync();
            await _dbContext.Entry(user).Collection(u => u.Notebooks).LoadAsync();
            await _dbContext.Entry(user).Collection(u => u.Connections).LoadAsync();
            return Ok(new { notebooks = user.Notebooks, notes = user.Notes, connections = user.Connections });
        }

        private async Task<CustomUser> GetLoggedInUser ()
        {
            return await _userManager.FindByIdAsync(GetLoggedInUserId());
        }
    }
}
