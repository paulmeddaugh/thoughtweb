namespace backend.Services;
public interface IAppSettingsService
{
    public string GetJWTIssuer ();
    public string GetJWTAudience ();
    public string GetJWTKey ();
}