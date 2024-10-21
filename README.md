### Running the Project
To run the project from the root directory, run:
```
cd backend/Frontend && yarn
cd ..
dotnet ef database update
dotnet ef migrations add InitialIdentityMigration
dotnet run
```

### Changing The Environment Mode
To change to either "Development" or "Production", run:
```
export ASPNETCORE_ENVIRONMENT={Development|Production}
```

### Helpful Resources
IHosting Error: https://stackoverflow.com/questions/58070476/asp-net-core-2-2-3-0-upgrade-env-isdevelopment-not-found
Identity (Username, Password login) Tutorial: https://www.youtube.com/watch?v=S0RSsHKiD6Y
Identity Endpoint Protection: https://andrewlock.net/exploring-the-dotnet-8-preview-introducing-the-identity-api-endpoints/
Facebook SSO: https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/?view=aspnetcore-8.0&tabs=visual-studio
SQL Server Connection Tutorial: https://learn.microsoft.com/en-us/dotnet/aspire/database/sql-server-integrations