package backend.notebook;

import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.LoadDatabase;
import backend.connection.ConnectionRepository;
import backend.note.NoteRepository;

@RestController
public class NotebookController {
    
    private final NotebookRepository repository;
    private final NoteRepository noteRepository;
    private final ConnectionRepository connRepository;
    private final NotebookModelAssembler assembler;
    private static final Logger log = LoggerFactory.getLogger(LoadDatabase.class);
    
    NotebookController(NotebookRepository repository, NotebookModelAssembler assembler,
            NoteRepository noteRepository, ConnectionRepository connRepo) {
        this.repository = repository;
        this.assembler = assembler;
        this.noteRepository = noteRepository;
        this.connRepository = connRepo;
    }
    
    // Aggregate root
    // tag::get-aggregate-root[]
    @GetMapping("/notebooks")
    CollectionModel<EntityModel<Notebook>> all() {
        List<EntityModel<Notebook>> Notebooks = repository.findAll().stream()
            .map(assembler::toModel)
            .collect(Collectors.toList());
        
        return CollectionModel.of(Notebooks,
            linkTo(methodOn(NotebookController.class).all()).withSelfRel());
    }
    // end::get-aggregate-root[]
    
    @PostMapping("/notebooks/new")
    Notebook newNotebook(@RequestBody Notebook newNotebook) {
        return repository.save(newNotebook);
    }
    
    // Single Notebook
    @GetMapping("/notebooks/{id}")
    EntityModel<Notebook> one(@PathVariable Long id) {
        Notebook Notebook = repository.findById(id)
                .orElseThrow(() -> new NotebookNotFoundException(id));
        
        return assembler.toModel(Notebook);
    }
    
    @PutMapping("/notebooks/{id}/update")
    Notebook replaceNotebook(@RequestBody Notebook newNotebook, @PathVariable Long id) {
        return repository.findById(id)
            .map(Notebook -> {
                Notebook.setIdUser(newNotebook.getIdUser());
                Notebook.setName(newNotebook.getName());
                return repository.save(Notebook);
            })
            .orElseGet(() -> {
                newNotebook.setId(id);
                return repository.save(newNotebook);
            });
    }
    
    @DeleteMapping("/notebooks/{id}/delete")
    @Transactional
    public void deleteNotebook(@PathVariable Long id) {
        noteRepository.findByIdNotebook((int) (long) id)
                .forEach(note -> {
                    noteRepository.delete(note);
                    int noteId = (int)(long) note.getId();
                    connRepository.deleteByIdNote1OrIdNote2(noteId, noteId);
                });
        repository.deleteById(id);
    }
    
    // All of a user's notebooks
    @GetMapping("/users/{id}/notebooks")
    public CollectionModel<EntityModel<Notebook>> user(@PathVariable Long id) {
        List<EntityModel<Notebook>> notebooks = repository.findByIdUser((int) (long) id).stream()
                .map(assembler::toModel)
                .collect(Collectors.toList());
        
        return CollectionModel.of(notebooks,
                linkTo(methodOn(NotebookController.class).user(id)).withSelfRel());
    }
}