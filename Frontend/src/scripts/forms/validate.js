export const invalidInputMessage = {
    'name': (name) => !/^[a-zA-Z ]+$/.test(name) 
        ? "Please enter a valid name." 
        : null,
    'usn': (usn) => !/^[a-zA-Z0-9@-_$]+$/.test(usn) 
        ? "Please enter a valid username." 
        : null,
    'email': (email) => !/^[\w.]+@\w+\.\w+$/.test(email) 
        ? "Please enter a valid email." 
        : null,
    'pwd': (p) => !(p.length >= 8 && p.length <= 15)
        ? "Please enter a password with 8-15 characters." 
        : null,
    'repwd': (p1, inputState) => (p1 !== inputState?.pwd) 
        ? "Passwords do not match." 
        : null,
    'reminder': (rem) => !(rem.length > 0 && rem.length <= 45) 
        ? "Reminder must be 45 characters or shorter" 
        : null,
};