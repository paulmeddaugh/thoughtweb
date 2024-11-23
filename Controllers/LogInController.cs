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
using Microsoft.Identity.Client;
using backend.Util;
using Microsoft.AspNetCore.Authorization;
using System.Net;

namespace backend.Controllers
{
    [Route("api/login")]
    public class LogInController : BaseController
    {

        private readonly UserManager<CustomUser> _userManager;
        private readonly SignInManager<CustomUser> _signInManager;
        private readonly IJWTTokens _jwtTokens;

        public LogInController (
            UserManager<CustomUser> userManager, 
            SignInManager<CustomUser> signInManager, 
            IJWTTokens jwtTokens
        ) {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokens = jwtTokens;
        }

        [HttpPost]
        public async Task Login ([FromBody] CustomUserLogin login)
        {
            // LOG IN ISN'T RECOGNIZED BY IDENTITY

            bool usingEmail = !string.IsNullOrEmpty(login.Email) || string.IsNullOrEmpty(login.UserName);
            if (usingEmail && string.IsNullOrEmpty(login.Email))
            {
                throw new CustomUserException("An email or username is required to login.");
            }

            _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;

            var emailUser = usingEmail
                ? await _userManager.FindByEmailAsync(login.Email)
                : null;

            if (usingEmail && emailUser == null) {
                throw new CustomUserException("The email provided does not belong to any account.");
            }

            var username = usingEmail
                ? emailUser.UserName
                : login.UserName;

            var result = await _signInManager.PasswordSignInAsync(username, login.Password, isPersistent: false, lockoutOnFailure: true);
            if (!result.Succeeded)
            {
                throw new CustomUserException("Invalid credentials.", HttpStatusCode.Unauthorized);
            }
        }

        [HttpGet("google")]
        public IActionResult GoogleLogin(string returnUrl = "/")
        {
            var token = (returnUrl.Contains('?') ? "&" : "?")
                + $"token={_jwtTokens.GenerateEncodedToken(DateTime.Now.AddMinutes(5))}";
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(GoogleDefaults.AuthenticationScheme, returnUrl + token);
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [AllowAnonymous]
        [HttpGet("google-tokens")]
        async public Task GoogleLoginTokens(string token)
        {
            _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;

            if (!_jwtTokens.ValidateToken(token)) {
                throw new CustomUserException("Token is invalid.", HttpStatusCode.Unauthorized);
            }

            // Get the info from the External Cookie
            var info = await _signInManager.GetExternalLoginInfoAsync() 
                ?? throw new CustomUserException("ExternalLoginInfo missing");

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
                } else {

                    // The user does not have an account yet => create an account.
                    var email = info.Principal.FindFirstValue(ClaimTypes.Email);
                    var name = info.Principal.FindFirstValue(ClaimTypes.Name);
                    var newUser = new CustomUser { UserName = email, Email = email, Name = name };

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
                        }
                    }
                }
            } catch (Exception e) {
                if (e.Message.Contains("Headers are read-only, response has already started.")) {
                    // This is fine
                } else {
                    Console.WriteLine(e);
                    throw new CustomUserException(e.Message);
                }
            }
        }

        [HttpPost("/api/logout")]
        public IActionResult Logout()
        {
            // Invalidate sign in token
            return Ok("Logged out");
        }
    }
}
