using AspNetCore.Identity.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public class ApplicationDbContext : IdentityDbContext<CustomUser>
{

    public DbSet<CustomUser> CustomUsers { get; set; }
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Customize Identity table names
        builder.Entity<CustomUser>(entity => entity.ToTable("Users"));
        builder.Entity<IdentityRole>(entity => entity.ToTable("Roles"));
        builder.Entity<IdentityUserRole<string>>(entity => entity.ToTable("UserRoles"));
        builder.Entity<IdentityUserClaim<string>>(entity => entity.ToTable("UserClaims"));
        builder.Entity<IdentityUserLogin<string>>(entity => entity.ToTable("UserLogins"));
        builder.Entity<IdentityRoleClaim<string>>(entity => entity.ToTable("RoleClaims"));
        builder.Entity<IdentityUserToken<string>>(entity => entity.ToTable("UserTokens"));

        // Map columns to match the MySQL schema
        builder.Entity<CustomUser>(entity =>
        {
            entity.Property(u => u.Id).HasColumnName("id");
            entity.Property(u => u.Name).HasColumnName("name");
            entity.Property(u => u.UserName).HasColumnName("username");
            entity.Property(u => u.Email).HasColumnName("email");
            entity.Property(u => u.DateCreated).HasColumnName("date_created");
            entity.Property(u => u.Reminder).HasColumnName("reminder");
        });
        // builder.Entity<CustomUser>(entity => { entity.ToTable("User"); });
        // builder.UseIdentityColumns();
        // builder.Entity<CustomUser>().Property(u => u.)
        // builder.HasDefaultSchema("identity");
    }
}
