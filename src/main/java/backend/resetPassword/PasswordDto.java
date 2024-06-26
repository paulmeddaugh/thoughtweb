package backend.resetPassword;

public class PasswordDto {

    private String oldPassword;

    private String token;

    private String newPassword;
    
    PasswordDto (String oldPassword, String token, String newPassword) {
    	this.oldPassword = oldPassword;
    	this.token = token;
    	this.newPassword = newPassword;
    }

	public String getOldPassword() {
		return oldPassword;
	}

	public void setOldPassword(String oldPassword) {
		this.oldPassword = oldPassword;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}
}