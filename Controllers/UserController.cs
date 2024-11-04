using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AspNetCore.Identity.Database;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using backend.Contexts;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/user")]
    public class UserController : Controller
    {

        private readonly UserManager<CustomUser> _userManager = null;
        private readonly ApplicationDbContext _dbContext;

        public UserController (UserManager<CustomUser> userManager, ApplicationDbContext dbContext)
        {
            _userManager = userManager;
            _dbContext = dbContext;
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

        [HttpGet]
        public async Task<IActionResult> GetInfo()
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
        public IActionResult GetJournal()
        {
            var userId = GetLoggedInUserId();
            var nbList = _dbContext.Notebooks.Where(nb => nb.IdUser.Equals(userId)).ToList();
            var noteList = _dbContext.Notes.Where(nb => nb.IdUser.Equals(userId)).ToList();
            var connList = _dbContext.Connections.Where(nb => nb.IdUser.Equals(userId)).ToList();
            return Ok(new { notebooks = nbList, notes = noteList, connections = connList });
        }

        private string GetLoggedInUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }
    }
}
