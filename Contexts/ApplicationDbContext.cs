using System.Text.Json;
using AspNetCore.Identity.Database;
using backend.Models.Note;
using backend.Models.Note.Connection;
using backend.Models.Notebook;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace backend.Contexts;

public class ApplicationDbContext : IdentityDbContext<CustomUser>
{

    public DbSet<CustomUser> CustomUsers { get; set; }
    public DbSet<Note> Notes { get; set; }
    public DbSet<Notebook> Notebooks { get; set; }
    public DbSet<Connection> Connections { get; set; }
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Map columns to match the MySQL schema
        builder.Entity<CustomUser>(entity =>
        {
            entity.ToTable("users");
            entity.Property(u => u.Id).HasColumnName("id");
            entity.Property(u => u.UserName).HasColumnName("username");
            entity.Property(u => u.Email).HasColumnName("email");
        });
        builder.Entity<IdentityUserRole<string>>(entity => entity.ToTable("userRoles"));
        builder.Entity<IdentityUserClaim<string>>(entity => entity.ToTable("userClaims"));
        builder.Entity<IdentityUserLogin<string>>(entity => entity.ToTable("userLogins"));
        builder.Entity<IdentityUserToken<string>>(entity => entity.ToTable("userTokens"));
        builder.Entity<IdentityRole>(entity => entity.ToTable("roles"));
        builder.Entity<IdentityRoleClaim<string>>(entity => entity.ToTable("roleClaims"));
        
        builder.Entity<Notebook>(entity =>
        {
            entity.Property(n => n.NoteOrder)
                .HasConversion(
                    // Convert Dictionary to JSON string when saving to the database
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions) null),
                    // Convert JSON string back to Dictionary when reading from the database
                    v => JsonSerializer.Deserialize<Dictionary<long, string>>(v, (JsonSerializerOptions) null) 
                        ?? new Dictionary<long, string>()
                )
                .Metadata
                .SetValueComparer(new ValueComparer<Dictionary<long, string>>(
                    (d1, d2) => JsonSerializer.Serialize(d1, (JsonSerializerOptions)null) == JsonSerializer.Serialize(d2, (JsonSerializerOptions)null),
                    d => d == null ? 0 : JsonSerializer.Serialize(d, (JsonSerializerOptions)null).GetHashCode(),
                    d => d == null ? new Dictionary<long, string>() : JsonSerializer.Deserialize<Dictionary<long, string>>(JsonSerializer.Serialize(d, (JsonSerializerOptions)null), (JsonSerializerOptions)null)
                ));
        });

        builder.Entity<Connection>(entity => {
            entity
                .HasOne(c => c.Note1)
                .WithMany(n => n.ConnectionsAsNote1)
                .HasForeignKey(c => c.IdNote1)
                .HasConstraintName("FK_Connection_NoteId1");
            entity
                .HasOne(c => c.Note2)
                .WithMany(n => n.ConnectionsAsNote2)
                .HasForeignKey(c => c.IdNote2)
                .HasConstraintName("FK_Connection_NoteId2");
            entity
                .HasKey(c => new { c.IdNote1, c.IdNote2 });
        });
    }
}
