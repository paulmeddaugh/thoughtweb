using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AspNetCore.Identity.Database;

#nullable enable

namespace backend.Models.Note;
[Table("notes")]
public class Note
{
    [Column("id")]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("title")]
    [Required]
    public string Title { get; set; } = "";

    [Column("text", TypeName = "LONGTEXT")]
    public string Text { get; set; } = "";

    [Column("quotes", TypeName = "LONGTEXT")]
    public string Quotes { get; set; } = "";

    [Column("id_notebook")]
    [ForeignKey("FK_Note_NotebookId")]
    public long? IdNotebook { get; set; }

    [JsonIgnore]
    [InverseProperty(nameof(Notebook.Notes))]
    [ForeignKey(nameof(IdNotebook))]
    public virtual Notebook.Notebook? Notebook { get; set; }

    [Column("id_user")]    
    [ForeignKey("FK_Note_UserId")]
    [Required]
    public string IdUser { get; set; }

    [JsonIgnore]
    [InverseProperty(nameof(CustomUser.Notes))]
    [ForeignKey(nameof(IdUser))]
    public virtual CustomUser? User { get; set; } = null;
    
    [Column("is_main")]  
    public bool IsMain { get; set; } = true;
    
    [Column("date_created")]  
    public DateTime DateCreated { get; set; } = DateTime.Now;

    [Column("all_notes_position")]
    public string GlobalOrder { get; set; } = "";

    [JsonIgnore]
    [InverseProperty(nameof(Connection.Connection.Note1))]
    public virtual ICollection<Connection.Connection> ConnectionsAsNote1 { get; set; } = [];

    [JsonIgnore]
    [InverseProperty(nameof(Connection.Connection.Note2))]
    public virtual ICollection<Connection.Connection> ConnectionsAsNote2 { get; set; } = [];

    public Note()
    {
        DateCreated = DateTime.Now;
        IdUser = "";
    }

    public Note(string title, string text, string quotes, string idUser, int idNotebook, bool isMain)
    {
        Title = title;
        Text = text;
        Quotes = quotes;
        IdUser = idUser;
        IdNotebook = idNotebook;
        IsMain = isMain;
        DateCreated = DateTime.Now;
    }

    public Note(string title, string text, string quotes, string idUser, int idNotebook, bool isMain, string order)
        : this(title, text, quotes, idUser, idNotebook, isMain)
    {
        GlobalOrder = order;
    }

    public override bool Equals(object? obj)
    {
        return obj is Note note &&
                Id == note.Id &&
                Title == note.Title &&
                Text == note.Text &&
                Quotes == note.Quotes &&
                IdNotebook == note.IdNotebook &&
                IdUser == note.IdUser &&
                IsMain == note.IsMain &&
                DateCreated == note.DateCreated;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Id, Title, Text, Quotes, IdNotebook, IdUser, IsMain, DateCreated);
    }

    public override string ToString()
    {
        return $"Note{{Id={Id}, Title='{Title}', Text='{Text}', Quotes='{Quotes}', IdNotebook='{IdNotebook}', IdUser='{IdUser}', IsMain='{IsMain}', DateCreated='{DateCreated}'}}";
    }
}
