namespace backend.Util
{
    public interface IJWTTokens
    {
        /// <summary>
        /// Generates an encoded JWT (JSON Web Token) for a user.
        /// </summary>
        /// <param name="expire">The date and time when the token should expire.</param>
        /// <param name="roles">A list of the roles associated with the user, used for role-based authorization.</param>
        /// <returns>A JWT as a string, ready for use in HTTP headers for authentication.</returns>
        public string GenerateEncodedToken(DateTime expire, string userId = null, IList<string> roles = null);

        public bool ValidateToken(string token);
        public string ExtractUserIdFromToken(string token);
    }
}