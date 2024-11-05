
namespace backend.Services;
public interface IEmailSender
{
    public Task SendEmailAsync(string email, string subject, string message);
    public Task SendResetPasswordLinkAsync (string email, string recipientName, string redirectUrl);
}