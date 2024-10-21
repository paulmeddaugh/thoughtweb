SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema Team4
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema Team4
-- -----------------------------------------------------
-- CREATE SCHEMA IF NOT EXISTS `Team4` DEFAULT CHARACTER SET utf8 ;
USE `Team4` ;

-- -----------------------------------------------------------------

DROP TABLE Team4.Connections;
DROP TABLE Team4.Notes;
DROP TABLE Team4.Emotions;
DROP TABLE Team4.Notebooks;
DROP TABLE Team4.User;

-- -----------------------------------------------------------

-- -----------------------------------------------------
-- Table `Team4`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Team4`.`User` (
  `idUser` INT AUTO_INCREMENT,
  `email` VARCHAR(26) NOT NULL,
  `name` VARCHAR(26) NOT NULL,
  `username` VARCHAR(26) NOT NULL,
  `pwd` VARCHAR(15) NOT NULL,
  `reminder` VARCHAR(45) NOT NULL,
  `dateCreated` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idUser`),
  UNIQUE INDEX `idUser_UNIQUE` (`idUser` ASC),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Team4`.`Notebooks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Team4`.`Notebooks` (
  `idNotebook` INT AUTO_INCREMENT,
  `idUser` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`idNotebook`),
  UNIQUE INDEX `idNotebook_UNIQUE` (`idNotebook` ASC),
  FOREIGN KEY (`idUser`)
    REFERENCES `Team4`.`User` (`idUser`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Team4`.`Emotions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Team4`.`Emotions` (
  `idEmotion` INT AUTO_INCREMENT,
  `name` VARCHAR(22) NOT NULL,
  `idUser` INT NULL,
  PRIMARY KEY (`idEmotion`),
  UNIQUE INDEX `idEmotion_UNIQUE` (`idEmotion` ASC),
  FOREIGN KEY (`idUser`)
    REFERENCES `Team4`.`User` (`idUser`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Team4`.`Notes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Team4`.`Notes` (
  `idNote` INT AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL,
  `idEmotions` VARCHAR (250) NULL,
  `text` VARCHAR(30000) NOT NULL,
  `quotes` VARCHAR(30000) NOT NULL,
  `idNotebook` INT NOT NULL,
  `idUser` INT NOT NULL,
  `isMain` BOOLEAN NOT NULL,
  `dateCreated` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idNote`),
  UNIQUE INDEX `idNote_UNIQUE` (`idNote` ASC),
  CONSTRAINT `fk_idEmotion`
    FOREIGN KEY (`idEmotion`) 
    REFERENCES `Team4`.`Emotions` (`idEmotion`),
  CONSTRAINT `fk_idNotebook`
    FOREIGN KEY (`idNotebook`) 
    REFERENCES `Team4`.`Notebooks` (`idNotebook`),
  CONSTRAINT `fk_idUser`
    FOREIGN KEY (`idUser`) 
    REFERENCES `Team4`.`User` (`idUser`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Team4`.`Connections`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Team4`.`Connections` (
  `idNote1` INT NOT NULL,
  `idNote2` INT NOT NULL,
  `idUser` INT NOT NULL,
  PRIMARY KEY (`idNote1`, `idNote2`),
  FOREIGN KEY (`idNote1`)
    REFERENCES `Team4`.`Notes` (`idNote`),
  FOREIGN KEY (`idNote2`)
    REFERENCES `Team4`.`Notes` (`idNote`),
  FOREIGN KEY (`idUser`)
    REFERENCES `Team4`.`User` (`idUser`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT INTO Emotions (name) VALUES ("Angry");
INSERT INTO Emotions (name) VALUES ("Sad");
INSERT INTO Emotions (name) VALUES ("Happy");
INSERT INTO Emotions (name) VALUES ("Joyful");
INSERT INTO Emotions (name) VALUES ("Mellow");
INSERT INTO Emotions (name) VALUES ("Contemplative");
INSERT INTO Emotions (name) VALUES ("Confused");
INSERT INTO Emotions (name) VALUES ("Excited");
INSERT INTO Emotions (name) VALUES ("Depressed");
INSERT INTO Emotions (name) VALUES ("Accomplished");