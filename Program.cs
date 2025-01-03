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
using Microsoft.AspNetCore.Authentication.BearerToken;

var builder = WebApplication.CreateBuilder(args);

var env = builder.Environment;
var configuration = builder.Configuration;
var services = builder.Services;

// SQL Server in production
if (!env.IsDevelopment()) {

    var server = Environment.GetEnvironmentVariable("MYSQLHOST");
    var port = Environment.GetEnvironmentVariable("MYSQLPORT");
    var database = Environment.GetEnvironmentVariable("MYSQLDATABASE");
    var user = Environment.GetEnvironmentVariable("MYSQLUSER");
    var password = Environment.GetEnvironmentVariable("MYSQLPASSWORD");

    var connectionString = $"Server={server};Port={port};Database={database};User={user};Password={password};";

    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
        
// Mock DB with SqLite using file if development
} else {
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite("DataSource=localSqlite.db")
    );
}

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

services.AddTransient<IEmailSender, EmailSender>();

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
        options.DefaultAuthenticateScheme = IdentityConstants.BearerScheme;
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

        googleOptions.Events.OnRedirectToAuthorizationEndpoint = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api/login/google")) 
            {
                context.Response.Redirect(context.RedirectUri);
            } else 
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            }
            return Task.CompletedTask;
        };

    })
    .AddBearerToken(IdentityConstants.BearerScheme, options =>
    {
        options.Events = new BearerTokenEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Token == null)
                {
                    context.HttpContext.Items["AuthenticationFailure"] = "Token is missing";
                }
                if (!context.HttpContext.Items.ContainsKey("AuthenticationFailure"))
                {
                    context.HttpContext.Items["AuthenticationFailure"] = "Token is invalid or expired";
                }
                return Task.CompletedTask;
            },
        };
    })
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
app.Use(async (context, next) =>
{
    await next();

    // Check for 401 Unauthorized responses and modify the response
    if (context.Response.StatusCode == StatusCodes.Status401Unauthorized &&
        context.Items.TryGetValue("AuthenticationFailure", out var failureMessage))
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Unauthorized",
            message = failureMessage
        });
    }
});
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