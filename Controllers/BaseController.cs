using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;
public abstract class BaseController : Controller
{        
    protected string GetLoggedInUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}