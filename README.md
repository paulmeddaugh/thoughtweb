# Running the Project
To run the dev project from the root directory, run:
```
cd backend/Frontend && yarn
cd ..
dotnet user-secrets set "Authentication:Google:ClientId" "<client_id>" #For Google SSO
dotnet user-secrets set "Authentication:Google:ClientSecret" "<client_secret>" #For Google SSO
dotnet user-secrets set "EmailSender:Gmail:Password" "<gmail_password>" #For sending emails using Gmail
dotnet ef migrations add InitialIdentityMigration
dotnet ef database update
dotnet run
```

### Changing The Environment Mode
To change to either "Development" or "Production", run:
```
export ASPNETCORE_ENVIRONMENT=<Development|Production>
```

### Generating Controllers
```
dotnet aspnet-codegenerator controller -name <ControllerName> -async -api -m <ModelClass> -dc ApplicationDbContext -outDir Controllers
```

### Helpful Resources
IHosting Error: https://stackoverflow.com/questions/58070476/asp-net-core-2-2-3-0-upgrade-env-isdevelopment-not-found
Identity (Username, Password login) Tutorial: https://www.youtube.com/watch?v=S0RSsHKiD6Y
Identity Endpoint Protection: https://andrewlock.net/exploring-the-dotnet-8-preview-introducing-the-identity-api-endpoints/
Identity AddIdentityCore vs AddDefaultIdentity: https://www.youtube.com/watch?app=desktop&v=Z7nfi8CVGSQ
Google SSO: https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/google-logins?view=aspnetcore-8.0
Google SSO Bearer Issue: https://stackoverflow.com/questions/78083217/asp-net-core-8-with-google-sign-in-statuscode-cannot-be-set-because-the-response
SQL Server Connection Tutorial: https://learn.microsoft.com/en-us/dotnet/aspire/database/sql-server-integrations
EF Core Database Migration Reverting: https://code-maze.com/efcore-how-to-revert-a-migration/
JWT Access and Refresh Tokens: https://medium.com/@KumarHalder/token-based-authentication-in-asp-net-core-43e99aee0593
JWT Validation: https://stackoverflow.com/questions/50204844/how-to-validate-a-jwt-token
Deleting multiple records RESTfully: https://stackoverflow.com/questions/21863326/delete-multiple-records-using-rest
Email Sender: https://tutorials.eu/how-to-send-emails-in-asp-net-web-applications/