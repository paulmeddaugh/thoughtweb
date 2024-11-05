
using System.Net;
using System.Net.Mail;

namespace backend.Services;
public class EmailSender : IEmailSender
{
    // private readonly _options
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public EmailSender (IWebHostEnvironment env, IConfiguration configuration)
    {
        _env = env;
        _configuration = configuration;
    }

    public Task SendEmailAsync(string email, string subject, string message)
    {
        var senderEmail = "paul.meddaugh@gmail.com";
        var senderPassword = _env.IsDevelopment()
            ? _configuration["EmailSender:Gmail:Password"]
            : Environment.GetEnvironmentVariable("GMAIL_PASSWORD");

        var client = new SmtpClient("smtp.gmail.com", 587) // Host, port
        {
            EnableSsl = true,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(senderEmail, senderPassword),
        };
        
        return client.SendMailAsync(
            new MailMessage(
                from: senderEmail,
                to: email,
                subject,
                message
            )
        );
    }

    public async Task SendResetPasswordLinkAsync (string email, string recipientName, string redirectUrl)
    {
        var body = string.Join("\r\n", new List<string>
        {
            $"Hello {recipientName},",
            "",
            "To reset your password, please go to the following link:",
            $"{redirectUrl}",
            "",
            "Sincerely,",
            "The ThoughtWeb Team"
        });
        await SendEmailAsync(email, "ThoughtWeb: Reset Password Link", body);       
    }
}