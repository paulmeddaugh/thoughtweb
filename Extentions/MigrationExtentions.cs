using AspNetCore.Identity.Database;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace AspNetCore.Identity.Extensions;

public static class MigrationExtentions
{
    public static void ApplyMigrations(this IApplicationBuilder app)
    {
        using IServiceScope scope = app.ApplicationServices.CreateScope();
        using ApplicationDbContext context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
    }
}