using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AspNetCore.Identity.Database;

#nullable enable

namespace backend.Models.Note.Connection;
[Table("connections")]
public class Connection
{
    [Column("id")]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("id_note1")]
    [Required]
    public long IdNote1 { get; set; }

    [JsonIgnore]
    [ForeignKey(nameof(IdNote1))]
    public virtual Note? Note1 { get; set; } = null;

    [Column("id_note2")]
    [Required]
    public long IdNote2 { get; set; }

    [JsonIgnore]
    [ForeignKey(nameof(IdNote2))]
    public virtual Note? Note2 { get; set; } = null;


    [Column("id_user")]
    [Required]
    [ForeignKey("FK_Connection_UserId")]
    public string IdUser { get; set; }

    [JsonIgnore]
    [InverseProperty(nameof(CustomUser.Connections))]
    [ForeignKey(nameof(IdUser))]
    public virtual CustomUser? User { get; set; } = null;

    public Connection(long idNote1, long idNote2, string idUser)
    {
        IdNote1 = idNote1;
        IdNote2 = idNote2;
        IdUser = idUser ?? throw new ArgumentNullException(nameof(idUser));
    }

    public override bool Equals(object? obj)
    {
        return obj is Connection connection &&
                Id == connection.Id &&
                IdNote1 == connection.IdNote1 &&
                IdNote2 == connection.IdNote2 &&
                IdUser == connection.IdUser;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Id, IdNote1, IdNote2, IdUser);
    }

    public override string ToString()
    {
        return $"Note{{Id={Id}, IdNote1='{IdNote1}', IdNote2='{IdNote2}', IdUser='{IdUser}'}}";
    }
}
