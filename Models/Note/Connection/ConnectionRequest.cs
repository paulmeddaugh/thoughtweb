namespace backend.Models.Note.Connection;
public class ConnectionRequest
{
    public long? Id { get; set; }
    public long IdNote1 { get; set; }
    public long IdNote2 { get; set; }
    public string IdUser { get; set; }

    public Connection ToConnection () {
        return new Connection(IdNote1, IdNote2, IdUser);
    }
}