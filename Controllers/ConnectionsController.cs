using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Contexts;
using backend.Models.Note.Connection;
using System.Security.Claims;
using backend.Models.ExceptionDTO;
using Microsoft.AspNetCore.Identity;
using AspNetCore.Identity.Database;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ConnectionsController : BaseController
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<CustomUser> _userManager;

        public ConnectionsController(ApplicationDbContext context, UserManager<CustomUser> userManager)
        {
            _dbContext = context;
            _userManager = userManager;
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
        public async Task<ActionResult<Connection>> CreateConnections(List<ConnectionRequest> connections)
        {
            List<object> createdConnections = [];
            for (int i = 0; i < connections.Count; i++)
            {
                Connection connection = connections[i].ToConnection();
                if (!ConnectionBelongsToUser(connection))
                {
                    return Unauthorized(new ExceptionDTO($"Index {i} of connections to create is unauthorized. "
                        + "All previous indices has been created."));
                }

                // Connection already exists
                if (_dbContext.Connections.Find(connection.IdNote1, connection.IdNote2) != null
                    || _dbContext.Connections.Find(connection.IdNote2, connection.IdNote1) != null) {
                    continue;
                }

                _dbContext.Connections.Add(connection);
                await _dbContext.SaveChangesAsync();

                createdConnections.Add(new {
                    connection,
                    Uri = Url.Action(nameof(GetConnection), new { id = connection.Id })
                });
            }

            return Ok(createdConnections);
        }

        // PATCH: api/Connections/delete-requests
        [HttpPatch("delete-requests")]
        public async Task<IActionResult> DeleteConnection(List<ConnectionRequest> connections)
        {
            // Loads user connections
            var user = await _userManager.FindByIdAsync(GetLoggedInUserId());
            await _dbContext.Entry(user).Collection(u => u.Connections).LoadAsync();

            for (int i = 0; i < connections.Count; i++)
            {
                var connection = connections[i];
                var actualConnection = connection.Id != null
                    ? await _dbContext.Connections.FindAsync(connection.Id)
                    : user.Connections.FirstOrDefault(c => 
                        c.IdNote1 == connection.IdNote1 && c.IdNote2 == connection.IdNote2
                    );

                if (actualConnection == null)
                {
                    return NotFound(new ExceptionDTO($"Index {i} of connections to delete was not found. "
                        + "All previous indices has been deleted."));
                }

                _dbContext.Connections.Remove(actualConnection);
                await _dbContext.SaveChangesAsync();
            }

            return Ok($"{connections.Count} connection(s) successfully deleted.");
        }

        private bool ConnectionExists(long id)
        {
            return _dbContext.Connections.Any(e => e.Id == id);
        }

        private bool ConnectionBelongsToUser(Connection connection)
        {
            var userId = GetLoggedInUserId();
            return connection.IdUser.Equals(userId);
        }
    }
}
