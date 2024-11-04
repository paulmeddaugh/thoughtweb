using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using AspNetCore.Identity.Database;
using AspNetCore.Identity.Extensions;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.Google;
using backend.Services;
using backend.Util;
using backend.Contexts;

var builder = WebApplication.CreateBuilder(args);

var env = builder.Environment;
var configuration = builder.Configuration;
var services = builder.Services;

// SQL Server
if (!env.IsDevelopment()) {

    var server = Environment.GetEnvironmentVariable("MYSQLHOST");
    var port = Environment.GetEnvironmentVariable("MYSQLPORT");
    var database = Environment.GetEnvironmentVariable("MYSQLDATABASE");
    var user = Environment.GetEnvironmentVariable("MYSQLUSER");
    var password = Environment.GetEnvironmentVariable("MYSQLPASSWORD");

    var connectionString = $"Server={server};Port={port};Database={database};User={user};Password={password};";

    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
        
// Uses Mock DB with SqLite using file if development
} else {
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite("DataSource=localSqlite.db")
    );
}

// Identity default options
services.Configure<IdentityOptions>(options =>
{
    // Password settings
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 0;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings
    options.User.AllowedUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;
});

services.AddDatabaseDeveloperPageExceptionFilter(); // Developer page exception filter (for migrations and errors during dev)

// Identity services
services.AddIdentityCore<CustomUser>()
    .AddSignInManager<SignInManager<CustomUser>>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddApiEndpoints();

services.AddSingleton<IAppSettingsService, AppSettingsService>();
services.AddSingleton<IJWTTokens, JWTTokens>();

services.AddControllers(options => 
{
    options.Filters.Add<CustomUserExceptionFilter>();
});

services.AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.BearerScheme;
        options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
    })
    .AddGoogle(GoogleDefaults.AuthenticationScheme, googleOptions =>
    {
        googleOptions.SaveTokens = true;
        googleOptions.SignInScheme = IdentityConstants.ExternalScheme;
        googleOptions.ClientId = !env.IsDevelopment()
            ? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID")
            : configuration["Authentication:Google:ClientId"]; // from dotnet user-secrets;
        googleOptions.ClientSecret = !env.IsDevelopment()
            ? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET")
            : configuration["Authentication:Google:ClientSecret"]; // from dotnet user-secrets
    })
    .AddBearerToken(IdentityConstants.BearerScheme)
    .AddCookie(IdentityConstants.ExternalScheme);
    
services.AddAuthorizationBuilder();

services.AddEndpointsApiExplorer();
services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "thoughtweb API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[] {}
        }
    });
});

// In production, the React files will be served from this directory
services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "Frontend/build";
});

var app = builder.Build();

if (env.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseMigrationsEndPoint();
    app.ApplyMigrations();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
// app.UseStaticFiles();
app.UseSpaStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA
app.MapWhen(context => 
    !context.Request.Path.StartsWithSegments("/api") 
    && !context.Request.Path.StartsWithSegments("/signin-google")
    && !context.Request.Path.StartsWithSegments("/swagger"), 
    spaApp =>
    {
        spaApp.UseSpa(spa =>
        {
            spa.Options.SourcePath = "Frontend";

            if (env.IsDevelopment())
            {
                spa.UseReactDevelopmentServer(npmScript: "start");
            }
        });
    }
);

app.Run();