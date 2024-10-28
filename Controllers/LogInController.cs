using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using AspNetCore.Identity.Database;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity.UI.V4.Pages.Account.Internal;
using Models.CustomUser;
using Microsoft.Identity.Client;

namespace backend.Controllers
{
    [Route("api/login")]
    public class LogInController : Controller
    {

        private readonly UserManager<CustomUser> _userManager = null;
        private readonly SignInManager<CustomUser> _signInManager = null;

        public LogInController (UserManager<CustomUser> userManager, SignInManager<CustomUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("internal")]
        public async void Login ([FromBody] CustomUserLogin login, [FromQuery] bool? loginWithUsername)
        {
            _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;

            try {
                var usingEmail = loginWithUsername != true || login.UserName == null;
                var username = usingEmail
                    ? (await _userManager.FindByEmailAsync(login.Email))?.UserName
                    : login.UserName;

                var result = await _signInManager.PasswordSignInAsync(username, login.Password, isPersistent: false, lockoutOnFailure: true);
                if (!result.Succeeded)
                {
                    // return Unauthorized(result.ToString());
                }
            } catch (Exception e) {
                Console.WriteLine(e);
            }
        }

        [HttpGet("google")]
        public IActionResult GoogleLogin(string returnUrl = "/")
        {
            var redirectUrl = Url.Action(nameof(ExternalSignIn), "LogIn", new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(GoogleDefaults.AuthenticationScheme, redirectUrl);
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("external")]
        async public void ExternalSignIn(string returnUrl = "/")
        {
            _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;

            // Get the info from the External Cookie
            var info = await _signInManager.GetExternalLoginInfoAsync() 
                ?? throw new InvalidOperationException("ExternalLoginInfo missing");

            // Sign in the user with this external login provider if the user already has a login.
            var result =
                await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey,
                    isPersistent: false);
            try {
                if (result.Succeeded)
                {
                    // Update any authentication tokens if login succeeded
                    await _signInManager.UpdateExternalAuthenticationTokensAsync(info);

                    // Store the access token and resign in so the token is included in the bearer token
                    var existingUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
                    var props = new AuthenticationProperties();
                    props.StoreTokens(info.AuthenticationTokens!);

                    await _signInManager.SignInAsync(existingUser!, props);

                    // The signInManager already produced the needed response in the form of bearer token.
                    // return LocalRedirect(returnUrl);
                } else {

                    // The user does not have an account yet => create an account.
                    var email = info.Principal.FindFirstValue(ClaimTypes.Email);
                    var newUser = new CustomUser { UserName = email, Email = email };

                    var createResult = await _userManager.CreateAsync(newUser);
                    if (createResult.Succeeded)
                    {
                        var addLoginResult = await _userManager.AddLoginAsync(newUser, info);
                        if (addLoginResult.Succeeded)
                        {
                            await _signInManager.SignInAsync(newUser, isPersistent: false);

                            // Update any authentication tokens as well
                            await _signInManager.UpdateExternalAuthenticationTokensAsync(info);

                            // The signInManager already produced the needed response in the form of bearer token.
                            // return LocalRedirect(returnUrl);
                        }
                    }
                }
            } catch (Exception e) {
                if (e.Message.Contains("Headers are read-only, response has already started.")) {
                    // Fine
                } else {
                    Console.WriteLine(e);
                    throw;
                }
            }
        }

        [HttpGet("login-google-response")]
        public async Task<IActionResult> GoogleResponse(string returnUrl = "/logged-in")
        {
            Console.WriteLine("signin-google");
            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
            if (!result.Succeeded)
            {
                // return RedirectToAction(nameof(GoogleLogin));
                return BadRequest("Failed");
            }

            // Optionally, you can handle user info here
            var claims = result.Principal?.Identities.FirstOrDefault()?.Claims;
            // Extract user info from claims and use it in your app
            var info = claims.Select(claim => new {
                claim.Issuer,
                claim.OriginalIssuer,
                claim.Type,
                claim.Value,
            });
            // return LocalRedirect(returnUrl);
            return Json(info);

            // var info = await _signInManager.GetExternalLoginInfoAsync();
            // if (info == null) return Unauthorized();

            // // Try to sign in the user with the external provider
            // var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);
            // if (result.Succeeded)
            // {
            //     // Get the user
            //     var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

            //     // Issue the token using Identity's Bearer token mechanism
            //     var token = await _signInManager.CreateUserPrincipalAsync(user);
            //     return Ok(new { Token = token });
            // }

            // // If user does not exist, create a new account
            // var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            // var user = new CustomUser { UserName = email, Email = email };
            // var identityResult = await _userManager.CreateAsync(user);
            // if (identityResult.Succeeded)
            // {
            //     await _userManager.AddLoginAsync(user, info);

            //     // Issue the token after the new user is created
            //     var token = await _signInManager.CreateUserPrincipalAsync(user);
            //     return Ok(new { Token = token });
            // }

            // return BadRequest("Unable to create account.");
        }
    }
}
