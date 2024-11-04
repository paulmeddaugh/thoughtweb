using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Contexts;
using backend.Models.Note;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConnectionsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ConnectionsController(ApplicationDbContext context)
        {
            _dbContext = context;
        }

        // GET: api/Connections
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Connection>>> GetConnections()
        {
            var userId = GetLoggedInUserId();
            return await _dbContext.Connections.Where(c => c.IdUser.Equals(userId)).ToListAsync();
        }

        // GET: api/Connections/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Connection>> GetConnection(long id)
        {
            var connection = await _dbContext.Connections.FindAsync(id);
            if (connection == null)
            {
                return NotFound();
            }

            if (!ConnectionBelongsToUser(connection))
            {
                return Unauthorized();
            }

            return connection;
        }

        // PUT: api/Connections/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConnection(long id, Connection connection)
        {
            var actualConnection = await _dbContext.Connections.FindAsync(id);
            if (actualConnection == null)
            {
                return NotFound();
            }

            if (!ConnectionBelongsToUser(actualConnection))
            {
                return Unauthorized();
            }

            if (id != connection.Id)
            {
                return BadRequest();
            }

            _dbContext.Entry(actualConnection).State = EntityState.Detached;
            _dbContext.Entry(connection).State = EntityState.Modified;

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConnectionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Connections
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Connection>> CreateConnection(Connection connection)
        {
            if (!ConnectionBelongsToUser(connection))
            {
                return Unauthorized();
            }

            _dbContext.Connections.Add(connection);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetConnection), new { id = connection.Id }, connection);
        }

        // DELETE: api/Connections/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConnection(long id)
        {
            var connection = await _dbContext.Connections.FindAsync(id);
            if (connection == null)
            {
                return NotFound();
            }

            if (!ConnectionBelongsToUser(connection))
            {
                return Unauthorized();
            }

            _dbContext.Connections.Remove(connection);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        private bool ConnectionExists(long id)
        {
            return _dbContext.Connections.Any(e => e.Id == id);
        }

        private string GetLoggedInUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        private bool ConnectionBelongsToUser(Connection connection)
        {
            var userId = GetLoggedInUserId();
            return connection.IdUser.Equals(userId);
        }
    }
}
