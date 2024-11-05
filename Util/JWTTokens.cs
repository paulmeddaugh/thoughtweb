using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using backend.Services;
using Microsoft.IdentityModel.Tokens;

namespace backend.Util
{
    public class JWTTokens : IJWTTokens
    {
        private static IAppSettingsService _appSettings;
        public JWTTokens (IAppSettingsService appSettings)
        {
            _appSettings = appSettings;
        }
        /// <summary>
        /// Generates an encoded JWT (JSON Web Token) for a user.
        /// </summary>
        /// <param name="userId">The ID of the user for whom the token is being generated.</param>
        /// <param name="device">The system or device information for user.</param>
        /// <param name="expire">The date and time when the token should expire.</param>
        /// <param name="roles">A list of the roles associated with the user, used for role-based authorization.</param>
        /// <returns>A JWT as a string, ready for use in HTTP headers for authentication.</returns>
        public string GenerateEncodedToken(DateTime expire, string userId = null, IList<string> roles = null)
        {
            // Initialize a list of claims for the JWT. These include the user's ID and device information,
            // a unique identifier for the JWT, and the time the token was issued.
            List<Claim> claims =
            [
                userId != null ? new Claim(JwtRegisteredClaimNames.Sub, userId) : null,
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.Ticks.ToString(), ClaimValueTypes.Integer64),
                // new Claim(ClaimTypes.System, device)
            ];

            // If any roles are provided, add them to the list of claims. Each role is a separate claim.
            if (roles?.Any() == true)
            {
                foreach (string role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            // Create the JWT security token and encode it.
            // The JWT includes the claims defined above, the issuer and audience from the config, and an expiration time.
            // It's signed with a symmetric key, also from the config, and the HMAC-SHA256 algorithm.
            JwtSecurityToken jwt = new(
                issuer: _appSettings.GetJWTIssuer(),
                audience: _appSettings.GetJWTAudience(),
                claims: claims,
                expires: expire,
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.GetJWTKey())),
                    SecurityAlgorithms.HmacSha256)
            );

            // Convert the JWT into a string format that can be included in an HTTP header.
            string encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            return encodedJwt;
        }

        public bool ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = GetValidationParameters();

            SecurityToken validatedToken;
            IPrincipal principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);
            return true;
        }

        private static TokenValidationParameters GetValidationParameters()
        {
            return new TokenValidationParameters()
            {
                ValidateLifetime = true, // Because there is no expiration in the generated token
                ValidateAudience = true, // Because there is no audiance in the generated token
                ValidateIssuer = true,   // Because there is no issuer in the generated token
                ValidIssuer = _appSettings.GetJWTIssuer(),
                ValidAudience = _appSettings.GetJWTAudience(),
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.GetJWTKey())) // The same key as the one that generate the token
            };
        }

        public string ExtractUserIdFromToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            return userId;
        }
    }
}