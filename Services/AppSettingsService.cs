namespace backend.Services;
public class AppSettingsService(IConfiguration configuration) : IAppSettingsService
{
    private string JWTIssuer { get; } = configuration["JWT:Issuer"];
    private string JWTAudience { get; } = configuration["JWT:Audience"];
    private string JWTKey { get; } = configuration["JWT:Key"];

    public string GetJWTIssuer ()
    {
        return JWTIssuer ?? "NoIssuer";
    }
    public string GetJWTAudience ()
    {
        return JWTAudience ?? "NoAudience";
    }
    public string GetJWTKey ()
    {
        return JWTKey ?? "NoKey";
    }
}