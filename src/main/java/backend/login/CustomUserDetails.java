package backend.login;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import backend.user.User;

public class CustomUserDetails implements UserDetails {
	
	User user;
	
	public CustomUserDetails(User user) {
		this.user = user;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return null;
	}
	
	public Long getId() {
		return user.getId();
	}

	@Override
	public String getPassword() {
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		return user.getUsername();
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	@Override
	public String toString() {
		return "CustomUserDetails{" + "id=" + this.getId() 
                + ", username='" + this.getUsername() + '\'' 
                + ", password='" + this.getPassword() + '\'' 
                + ", isAccountNonExpired='" + this.isAccountNonExpired() + '\'' 
                + ", isAccountNonLocked='" + this.isAccountNonLocked() + '\'' 
                + ", isCredentialsNonExpired='" + this.isCredentialsNonExpired() + '\'' 
                + ", isEnabled='" + this.isEnabled() + '\'' 
                + '}';
	}
}
