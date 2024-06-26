package backend.user;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import backend.connection.Connection;
import backend.connection.ConnectionController;
import backend.connection.ConnectionModelAssembler;
import backend.connection.ConnectionRepository;
import backend.login.CustomUserDetails;
import backend.login.CustomUserDetailsService;
import backend.note.Note;
import backend.note.NoteController;
import backend.note.NoteModelAssembler;
import backend.note.NoteRepository;
import backend.notebook.Notebook;
import backend.notebook.NotebookController;
import backend.notebook.NotebookModelAssembler;
import backend.notebook.NotebookRepository;

@RestController
@RequestMapping("/api")
public class UserController {
    
    private final UserRepository userRepository;
    private final NotebookRepository nbRepository;
    private final NoteRepository noteRepository;
    private final ConnectionRepository connRepository;
    
    private final UserModelAssembler userAssembler;
    private final NotebookModelAssembler nbAssembler;
    private final NoteModelAssembler noteAssembler;
    private final ConnectionModelAssembler connAssembler;
    
    private final UserService userService;
    
    @Autowired
    private CustomUserDetailsService customUserDetailsService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    UserController(UserRepository userRepository, NotebookRepository nbRepository,
            NoteRepository noteRepository, ConnectionRepository connRepository, 
            UserModelAssembler userAssembler, NotebookModelAssembler nbAssembler, 
            NoteModelAssembler noteAssembler, ConnectionModelAssembler connAssembler,
            UserService userService) {
        this.userRepository = userRepository;
        this.nbRepository = nbRepository;
        this.noteRepository = noteRepository;
        this.connRepository = connRepository;
        this.userAssembler = userAssembler;
        this.noteAssembler = noteAssembler;
        this.nbAssembler = nbAssembler;
        this.connAssembler = connAssembler;
        this.userService = userService;
    }
    
    @GetMapping("/user")
    public Map<String, Object> user(@AuthenticationPrincipal CustomUserDetails userDetails, @AuthenticationPrincipal OAuth2User oauth2UserDetails) {
    	
    	User user = ((userDetails != null)
    			? userRepository.findById(userDetails.getId())
    			: userRepository.findByUsernameIgnoreCase(oauth2UserDetails.getAttribute("email"))
    		).orElseThrow(() -> new UserNotFoundException());
    	
        return Collections.singletonMap("user", user.toPublicUser());
    }
    
    @GetMapping("/users/{id}/getJournal")
    CollectionModel<Object> userJournal(@PathVariable Long id) {
        
        int idUser = (int) (long) id;
        
        List<EntityModel<Notebook>> notebooks = nbRepository.findByIdUser(idUser).stream()
                .map(nbAssembler::toModel)
                .collect(Collectors.toList());
        CollectionModel<EntityModel<Notebook>> nbColl = CollectionModel.of(notebooks,
                linkTo(methodOn(UserController.class).notebooks(id)).withSelfRel());
        
        List<EntityModel<Note>> notes = noteRepository.findByIdUser(idUser).stream()
                .map(noteAssembler::toModel)
                .collect(Collectors.toList());
        CollectionModel<EntityModel<Note>> noteColl = CollectionModel.of(notes,
                linkTo(methodOn(UserController.class).notes(id)).withSelfRel());
        
        List<EntityModel<Connection>> conns = connRepository.findByIdUser(idUser).stream()
                .map(connAssembler::toModel)
                .collect(Collectors.toList());
        CollectionModel<EntityModel<Connection>> connColl = CollectionModel.of(conns,
                linkTo(methodOn(UserController.class).connections(id)).withSelfRel());
        
        List<Object> l = new ArrayList<>();
        l.add(nbColl);
        l.add(noteColl);
        l.add(connColl);
        
        return CollectionModel.of(l,
                linkTo(methodOn(UserController.class).userJournal(id)).withSelfRel());
    }
    
    @GetMapping("/users/{id}/notes")
    public CollectionModel<EntityModel<Note>> notes(@PathVariable Long id) {
        List<EntityModel<Note>> notes = noteRepository.findByIdUser((int) (long) id).stream()
                .map(noteAssembler::toModel)
                .collect(Collectors.toList());
        
        return CollectionModel.of(notes,
                linkTo(methodOn(UserController.class).notes(id)).withSelfRel());
    }
    
    @GetMapping("/users/{id}/notebooks")
    public CollectionModel<EntityModel<Notebook>> notebooks(@PathVariable Long id) {
        List<EntityModel<Notebook>> notebooks = nbRepository.findByIdUser((int) (long) id).stream()
                .map(nbAssembler::toModel)
                .collect(Collectors.toList());
        
        return CollectionModel.of(notebooks,
                linkTo(methodOn(UserController.class).notebooks(id)).withSelfRel());
    }
    
    @GetMapping("/users/{id}/connections")
    public CollectionModel<EntityModel<Connection>> connections(@PathVariable Long id) {
        List<EntityModel<Connection>> conns = connRepository.findByIdUser((int) (long) id).stream()
                .map(connAssembler::toModel)
                .collect(Collectors.toList());
        
        return CollectionModel.of(conns,
                linkTo(methodOn(UserController.class).connections(id)).withSelfRel());
    }
    
    @PostMapping("/users/newUser")
    @ResponseStatus(code = HttpStatus.CREATED)
    User newUser(@RequestBody User newUser) {
    	
    	Boolean usernameExists = userRepository.findByUsernameIgnoreCase(newUser.getUsername()).isPresent();
    	Boolean emailExists = userRepository.findByEmailIgnoreCase(newUser.getEmail()).isPresent();
    			
    	if (!usernameExists && !emailExists) {
    		newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
    		return userRepository.save(newUser);
    	} else {
    		throw new UserAlreadyExistsException(
    			usernameExists ? newUser.getUsername() : null, 
    			emailExists ? newUser.getEmail() : null
    		);
    	}
    }
    
    // Single User
    @GetMapping("/users/{id}")
    EntityModel<PublicUser> one(@PathVariable Long id) {
        User User = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        
        return userAssembler.toModel(User.toPublicUser());
    }
    
    @PutMapping("/users/{id}/updateUser")
    User replaceUser(@RequestBody User newUser, @PathVariable Long id) {
        return userRepository.findById(id)
            .map(User -> {
                User.setEmail(newUser.getEmail());
                User.setUsername(newUser.getUsername());
                User.setPassword(newUser.getPassword());
                User.setReminder(newUser.getReminder());
                User.setName(newUser.getName());
                User.setDateCreated(newUser.getDateCreated());
                return userRepository.save(User);
            })
            .orElseGet(() -> {
                newUser.setId(id);
                return userRepository.save(newUser);
            });
    }
    
    @DeleteMapping("/users/{id}/deleteUser")
    void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}