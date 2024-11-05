using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AspNetCore.Identity.Database;

namespace backend.Models.Notebook;

[Table("notebooks")]
public class Notebook
{
    [Column("id")]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; }

    // [Column("color")]
    // public string Color { get; set; } = null;

    [Column("id_user")]
    [ForeignKey("FK_Notebook_UserId")]
    [Required]
    public string IdUser { get; set; }

    [JsonIgnore]
    [InverseProperty(nameof(User.Notebooks))]
    [ForeignKey(nameof(IdUser))]
    public virtual CustomUser User { get; set; }

    [Column("date_created")]
    public DateTime DateCreated { get; set; } = DateTime.Now;

    [Column("note_order")]
    public Dictionary<long, string> NoteOrder { get; set; } = [];

    [JsonIgnore]
    [InverseProperty(nameof(Note.Note.Notebook))]
    public virtual ICollection<Note.Note> Notes { get; set; } = [];

    public Notebook()
    {
        DateCreated = DateTime.Now;
    }

    public Notebook(string name, string idUser)
    {
        Name = name;
        IdUser = idUser;
        DateCreated = DateTime.Now;
    }

    public override bool Equals(object obj)
    {
        return obj is Notebook notebook &&
                Id == notebook.Id &&
                Name == notebook.Name &&
                IdUser == notebook.IdUser &&
                DateCreated == notebook.DateCreated;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Id, Name, IdUser, DateCreated);
    }

    public override string ToString()
    {
        return $"Note{{Id={Id}, Name='{Name}', IdUser='{IdUser}', DateCreated='{DateCreated}'}}";
    }
}
