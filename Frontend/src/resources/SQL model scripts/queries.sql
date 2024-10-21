-- INSERT INTO User (email, name, username, pwd, reminder)
-- 	VALUES ("paul.meddaugh@gmail.com", "Paul", "Batblast", "theBat42", "I'm Batman");

INSERT INTO User (email, name, username, pwd, reminder)
	VALUES ("joker@gmail.com", "Joker", "theJoker", "Hahahaha", "Want to see a magic trick?");

INSERT INTO User (email, name, username, pwd, reminder)
	VALUES ("paul.meddaugh@gmail.com", "Paul", "AtLongLast", "Thoughts", "Posted on Twitter");

INSERT INTO Notebooks (idUser, name)
	VALUES (1, "The first");

INSERT IGNORE INTO Notes (title, idEmotion, text, quotes, idNotebook, idUser, isMain)
	VALUES ("You\'re cruel, you know", null, "to come here and speak of dreams. Yet here you are, watering my withered heart with your smile.", "- Your Lie In April", 1, 1, true);

INSERT IGNORE INTO Connections (idNote1, idNote2, idNotebook, idUser)
	VALUES (11, 18, 1, 1);
DELETE IGNORE FROM Connections WHERE idNote1 = 11 AND idNote2 = 18 AND idNotebook = 1 AND idUser = 1;

-- URL for testing addUpdateNote.php
-- http://localhost/thoughts/php/addUpdateNote.php?idUser=1&idNotebook=8&title=Yo%20Ho%20Ho&text=and%20a%20bottle%20a%27%27%20rum.&quotes=-%20Pirates%20of%20the%20Caribbean&isMain=false&addConnections=[%2211%22]&removeConnections=[]&idNote=19

-- Gets all notes and supporting note ids of certain user
SELECT idNote, title, idEmotion, date, text, quotes, n.idNotebook, s.idMain FROM Notes n 
    INNER JOIN User u ON u.idUser = n.idUser 
    LEFT OUTER JOIN SupportingNotes s ON n.idNote = s.idSupporting 
    WHERE n.idUser = '$idUser' order by idSupporting;

-- Gets all notes and supporting note id's of a certain notebook
SELECT idNote, title, idEmotion, date, text, quotes, n.idNotebook, s.idMain FROM Notes n 
    INNER JOIN User u ON u.idUser = n.idUser 
    LEFT OUTER JOIN SupportingNotes s ON n.idNote = s.idSupporting 
    WHERE n.idNotebook = '$idNotebook' order by idSupporting;

-- Gets columns for the notes, supporting notes id's, and notebook name of a certain idNote and idNotebook
SELECT * FROM Notes n 
    INNER JOIN Notebooks nb ON n.idNotebook = nb.idNotebook 
    INNER JOIN SupportingNotes s ON n.idNote = s.idMain 
    WHERE n.idNotebook = 2 AND s.idMain = 3;

-- User can add to another user's notebook