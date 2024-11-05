using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Note;
using backend.Models.Note.Connection;
using backend.Models.Notebook;
using Microsoft.AspNetCore.Identity;
namespace AspNetCore.Identity.Database;

public class CustomUser : IdentityUser 
{
    // Remaining names mapped in ApplicationDbContext
    [Column("name")]
    public string Name { get; set; } = "";

    [Column("reminder")]
    public string Reminder { get; set; } = "";

    [Column("date_created")]
    public DateTime DateCreated { get; set; } = DateTime.Now;

    [InverseProperty(nameof(Note.User))]
    public virtual ICollection<Note> Notes { get; set; }

    [InverseProperty(nameof(Notebook.User))]
    public virtual ICollection<Notebook> Notebooks { get; set; }

    [InverseProperty(nameof(Connection.User))]
    public virtual ICollection<Connection> Connections { get; set; }

    public CustomUser () : base() {
        DateCreated = DateTime.Now;
    }

    public static CustomUser FromCustomUserRequest (CustomUserRequest userRequest) {
        return new CustomUser {
            Name = userRequest.Name,
            UserName = userRequest.Username,
            Email = userRequest.Email,
            Reminder = userRequest.Reminder,
        };
    }

    public CustomUserDTO ToCustomUserDTO () {
        return new CustomUserDTO {
            Id = this.Id,
            Name = this.Name,
            Username = this.UserName,
            Email = this.Email,
            Reminder = this.Reminder,
            DateCreated = this.DateCreated,
        };
    }
}