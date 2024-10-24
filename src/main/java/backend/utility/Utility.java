package backend.utility;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;

public class Utility {
	public static String alphaNumericString(int len) {
	    String AB = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	    Random rnd = new Random();

	    StringBuilder sb = new StringBuilder(len);
	    for (int i = 0; i < len; i++) {
	        sb.append(AB.charAt(rnd.nextInt(AB.length())));
	    }
	    return sb.toString();
	}
}
