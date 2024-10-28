using Microsoft.AspNetCore.Identity;
using Models.CustomUser;
namespace AspNetCore.Identity.Database;
public class CustomUser : IdentityUser 
{
    public string Name { get; set; } = "";
    public string Reminder { get; set; } = "";
    public DateTime DateCreated { get; set; } = DateTime.Now;

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
        };
    }
}