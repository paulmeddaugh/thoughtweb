import { isValidEmail } from "../utility/utility";

export const invalidInputMessage = {
    'name': (name) => !/^[a-zA-Z ]+$/.test(name) 
        ? "Please enter a valid name." 
        : null,
    'usn': (usn) => !/^[a-zA-Z0-9@-_$]+$/.test(usn) 
        ? "Please enter a valid username." 
        : null,
    'email': (email) => !isValidEmail(email)
        ? "Please enter a valid email." 
        : null,
    'pwd': (p) => !(p.length >= 8 && p.length <= 40)
        ? "Please enter a password with 8-40 characters." 
        : null,
    'repwd': (p1, inputState) => (p1 !== inputState?.pwd) 
        ? "Passwords do not match." 
        : null,
    'reminder': (rem) => !(rem.length >= 0 && rem.length <= 45) 
        ? "Reminder must be 45 characters or shorter." 
        : null,
};

export const loginValidators = {
    'usn': (usn) => !usn
        ? "Please enter a username." 
        : null,
    'pwd': (password) => !password
        ? "Please enter a password." 
        : null,
}