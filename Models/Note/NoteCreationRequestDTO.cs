using System.ComponentModel.DataAnnotations.Schema;

#nullable enable

namespace backend.Models.Note;
[Table("notes")]
public class NoteCreationRequestDTO
{
    public string Title { get; set; } = "";
    public string Text { get; set; } = "";
    public string Quotes { get; set; } = "";
    public long? IdNotebook { get; set; }
    public string IdUser { get; set; }
    public bool IsMain { get; set; } = true;
    public DateTime DateCreated { get; set; } = DateTime.Now;
    public string GlobalOrder { get; set; } = "";
    public NoteCreationRequestDTO()
    {
        DateCreated = DateTime.Now;
        IdUser = "";
    }

    public NoteCreationRequestDTO(string title, string text, string quotes, string idUser, int idNotebook, bool isMain)
    {
        Title = title;
        Text = text;
        Quotes = quotes;
        IdUser = idUser;
        IdNotebook = idNotebook;
        IsMain = isMain;
        DateCreated = DateTime.Now;
    }
}
