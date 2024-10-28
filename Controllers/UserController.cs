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
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/users")]
    public class UserController : Controller
    {

        private readonly UserManager<CustomUser> _userManager = null;
        private readonly SignInManager<CustomUser> _signInManager = null;

        public UserController (UserManager<CustomUser> userManager, SignInManager<CustomUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [AllowAnonymous]
        [HttpPost("createUser")]
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
    }
}
