import { checkIfNumbers, checkIfString } from "../utility/errorHandling";

export class Connection {
    id;
    idNote1;
    idNote2;
    idUser;

    constructor (id, idNote1, idNote2, idUser) {
        checkIfNumbers({ idNote1, idNote2 });
        checkIfString({ idUser });
        this.id = id;
        this.idNote1 = idNote1;
        this.idNote2 = idNote2;
        this.idUser = idUser;
    }

    static fromIdNote2Array (id, idNote1, idNote2Array, idUser) {
        return idNote2Array.map(idNote2 => new Connection(id, idNote1, idNote2, idUser));
    }
}