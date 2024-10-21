using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Hosting; // IWebHostEnvironment
using backend.Models;
using AspNetCore.Identity.Database;
using AspNetCore.Identity.Extensions;
using System.Reflection;
using Microsoft.OpenApi.Models;

namespace backend
{
    public class Startup
    {
        public Startup(IWebHostEnvironment env, IConfiguration configuration)
        {
            Configuration = configuration;
            Env = env;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Env { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
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
                        new string[]{}
                    }
                });
            });
            services.AddControllersWithViews();

            if (!Env.IsDevelopment()) { // SQL Server

                var server = Environment.GetEnvironmentVariable("MYSQLHOST");
                var port = Environment.GetEnvironmentVariable("MYSQLPORT");
                var database = Environment.GetEnvironmentVariable("MYSQLDATABASE");
                var user = Environment.GetEnvironmentVariable("MYSQLUSER");
                var password = Environment.GetEnvironmentVariable("MYSQLPASSWORD");

                var connectionString = $"Server={server};Port={port};Database={database};User={user};Password={password};";

                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
                    
            } else { // Uses Mock DB with SqLite using file
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseSqlite("DataSource=localSqlite.db")
                );
            }

            // Identity default options
            services.Configure<IdentityOptions>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 1;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings
                options.User.AllowedUserNameCharacters =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = false;
            });

            // Configure application cookie settings
            services.ConfigureApplicationCookie(options =>
            {
                // Cookie settings
                options.Cookie.HttpOnly = true;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
                options.LoginPath = "/Identity/Account/Login";
                options.AccessDeniedPath = "/Identity/Account/AccessDenied";
                options.SlidingExpiration = true;
            });

            services.AddDatabaseDeveloperPageExceptionFilter(); // Developer page exception filter (for migrations and errors during dev)

            // Identity service configuration
            // services
            //     .AddDefaultIdentity<CustomUser>(options => 
            //         options.SignIn.RequireConfirmedAccount = true
            //     )
            //     .AddEntityFrameworkStores<ApplicationDbContext>()
            //     .AddApiEndpoints();

            services.AddIdentityCore<CustomUser>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddApiEndpoints();

            services.AddAuthentication()
                .AddBearerToken(IdentityConstants.BearerScheme);
                
            services.AddAuthorizationBuilder();

            // services.AddRazorPages();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "Frontend/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
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

            app.UseEndpoints(endpoints =>
            {
                // endpoints
                //     .MapControllerRoute(
                //         name: "default",
                //         pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints
                    .MapGroup("/account")
                    .MapIdentityApi<CustomUser>();
                endpoints
                    .MapControllers()
                    .RequireAuthorization();
            });
            
            app.MapWhen(context => 
                !context.Request.Path.StartsWithSegments("/account") 
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
        }
    }
}
