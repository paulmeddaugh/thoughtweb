using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Contexts;
using backend.Models.Note;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : BaseController
    {
        private readonly ApplicationDbContext _dbContext;

        public NotesController(ApplicationDbContext context)
        {
            _dbContext = context;
        }

        // GET: api/Notes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetUserNotes()
        {
            // Get all notes associated with logged in user
            var userId = GetLoggedInUserId();
            return await _dbContext.Notes.Where(note => note.IdUser.Equals(userId)).ToListAsync();
        }

        // GET: api/Notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(long id)
        {
            var note = await _dbContext.Notes.FindAsync(id);

            if (note == null)
            {
                return NotFound();
            }

            if (!NoteBelongsToUser(note))
            {
                return Unauthorized();
            }

            return note;
        }

        // PUT: api/Notes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(long id, Note note)
        {
            var actualNote = await _dbContext.Notes.FindAsync(id);
            if (actualNote == null) 
            {
                return NotFound();
            }

            if (!NoteBelongsToUser(actualNote))
            {
                return Unauthorized();
            }

            if (id != note.Id)
            {
                return BadRequest("Parameter id and note id do not match.");
            }

            _dbContext.Entry(actualNote).State = EntityState.Detached;
            _dbContext.Entry(note).State = EntityState.Modified;

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteExists(id))
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

        // POST: api/Notes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote(Note note)
        {
            // Verify note has same id as logged in user
            if (!NoteBelongsToUser(note))
            {
                return Unauthorized();
            }

            note.Id = 0; // Will instruct EF Core to treat this record as new

            _dbContext.Notes.Add(note);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }

        // DELETE: api/Notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(long id)
        {
            var note = await _dbContext.Notes.FindAsync(id);
            if (note == null)
            {
                return NotFound();
            }

            // Make sure note belongs to logged in user
            if (!NoteBelongsToUser(note))
            {
                return Unauthorized();
            }

            _dbContext.Notes.Remove(note);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        private bool NoteExists(long id)
        {
            return _dbContext.Notes.Any(e => e.Id.Equals(id));
        }

        private bool NoteBelongsToUser(Note note)
        {
            var userId = GetLoggedInUserId();
            return note.IdUser.Equals(userId);
        }
    }
}
