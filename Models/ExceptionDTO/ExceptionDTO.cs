namespace backend.Models.ExceptionDTO;
public class ExceptionDTO(string message)
{
    public string Message { get; set; } = message;
}