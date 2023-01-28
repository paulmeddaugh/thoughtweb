package backend.connection;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;

@Component
public class ConnectionModelAssembler implements RepresentationModelAssembler<Connection, EntityModel<Connection>> {

    @Override
    public EntityModel<Connection> toModel(Connection connection) {
        return EntityModel.of(connection, 
            linkTo(methodOn(ConnectionController.class).one(connection.getId())).withSelfRel(),
            linkTo(methodOn(ConnectionController.class)
            		.user((Long)(long) connection.getIdUser())).withRel("connections"));
    }
    
}
