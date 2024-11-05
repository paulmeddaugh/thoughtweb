using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using backend.Models.ExceptionDTO;

namespace AspNetCore.Identity.Database;
public class CustomUserException : Exception
{
    public HttpStatusCode HttpStatusCode = HttpStatusCode.BadRequest;

    public CustomUserException(string message) : base(message)
    {
    }

    public CustomUserException(string message, HttpStatusCode httpStatusCode) : base(message)
    {
        HttpStatusCode = httpStatusCode;
    } 
}

public class CustomUserExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is CustomUserException ex)
        {
            context.Result = new ObjectResult(new ExceptionDTO(ex.Message))
            {
                StatusCode = (int) ex.HttpStatusCode
            };
            context.ExceptionHandled = true; // Mark the exception as handled
        }
    }
}
