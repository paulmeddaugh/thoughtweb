using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Contexts;
using backend.Models.Notebook;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotebooksController : BaseController
    {
        private readonly ApplicationDbContext _dbContext;

        public NotebooksController(ApplicationDbContext context)
        {
            _dbContext = context;
        }

        // GET: api/Notebooks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notebook>>> GetNotebooks()
        {
            // Get all notebooks associated with logged in user
            var userId = GetLoggedInUserId();
            return await _dbContext.Notebooks.Where(nb => nb.IdUser.Equals(userId)).ToListAsync();
        }

        // GET: api/Notebooks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Notebook>> GetNotebook(long id)
        {
            var notebook = await _dbContext.Notebooks.FindAsync(id);

            if (notebook == null)
            {
                return NotFound();
            }

            if (!NotebookBelongsToUser(notebook))
            {
                return Unauthorized();
            }

            return notebook;
        }

        // PUT: api/Notebooks/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotebook(long id, Notebook notebook)
        {
            var actualNb = await _dbContext.Notebooks.FindAsync(id);
            if (actualNb == null) 
            {
                return NotFound();
            }

            if (!NotebookBelongsToUser(actualNb))
            {
                return Unauthorized();
            }
            
            if (id != notebook.Id)
            {
                return BadRequest();
            }

            _dbContext.Entry(actualNb).State = EntityState.Detached;
            _dbContext.Entry(notebook).State = EntityState.Modified;

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NotebookExists(id))
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

        // POST: api/Notebooks
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Notebook>> CreateNotebook(Notebook notebook)
        {
            if (!NotebookBelongsToUser(notebook))
            {
                return Unauthorized();
            }

            _dbContext.Notebooks.Add(notebook);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotebook), new { id = notebook.Id }, notebook);
        }

        // DELETE: api/Notebooks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotebook(long id)
        {
            var notebook = await _dbContext.Notebooks.FindAsync(id);
            if (notebook == null)
            {
                return NotFound();
            }

            if (!NotebookBelongsToUser(notebook))
            {
                return Unauthorized();
            }

            _dbContext.Notebooks.Remove(notebook);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        private bool NotebookExists(long id)
        {
            return _dbContext.Notebooks.Any(e => e.Id == id);
        }

        private bool NotebookBelongsToUser(Notebook notebook)
        {
            var userId = GetLoggedInUserId();
            return notebook.IdUser.Equals(userId);
        }
    }
}
