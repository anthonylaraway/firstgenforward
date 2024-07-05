-- SQL file used to build database
-- When changes are made, exisiting db must be removed before being built with this file
-- See README for info

-- Create user table
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `Name` varchar(64) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `UserType` enum('Admin','User') NOT NULL,
  `UserID` varchar(36) NOT NULL DEFAULT (uuid()),
  `Password` varchar(60) NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE (`Name`),
  UNIQUE (`Email`)
);


-- Insert dummy data into user table
-- All password hashes are for "password" as password
LOCK TABLES `user` WRITE;
INSERT INTO `user` VALUES ('real paul rudd','paulruddofficial@gmail.com','User','03057324-6eee-11ee-95c8-96fc48e250ac','$2a$14$j9YdDOpMqjblUfAOSjQ70.PZc7p1ogZ0OcaOoG9wwERP73twIXQtW'),
('MinecraftCreeper55','joshsandman@hotmail.com','User','09112b8c-6eed-11ee-95c8-96fc48e250ac','$2a$14$j9YdDOpMqjblUfAOSjQ70.PZc7p1ogZ0OcaOoG9wwERP73twIXQtW'),
('Zarina','zarinamyers01@gmail.com','User','153cc18b-6eee-11ee-95c8-96fc48e250ac','$2a$14$j9YdDOpMqjblUfAOSjQ70.PZc7p1ogZ0OcaOoG9wwERP73twIXQtW'),
('Nancy Wheeler','iluvdogs@comcast.net','Admin','1798bce1-6eed-11ee-95c8-96fc48e250ac','$2a$14$j9YdDOpMqjblUfAOSjQ70.PZc7p1ogZ0OcaOoG9wwERP73twIXQtW'),
('Mint','greenpenguin@gmail.com','User','2382da03-6eed-11ee-95c8-96fc48e250ac','$2a$14$j9YdDOpMqjblUfAOSjQ70.PZc7p1ogZ0OcaOoG9wwERP73twIXQtW');
UNLOCK TABLES;

-- Create post table for forums
DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `PostID` varchar(36) NOT NULL DEFAULT (uuid()),
  `Title` varchar(255) NOT NULL,
  `Text` varchar(10000) NOT NULL,
  `UserID` varchar(36) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT (NOW()),
  `LastUpdated` datetime NOT NULL DEFAULT (NOW()) ON UPDATE NOW(),
  PRIMARY KEY (`PostID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Post_creator` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`)
);

-- Insert dummy data into post table
LOCK TABLES `post` WRITE;
INSERT INTO `post` VALUES ('acfa0103-9a30-4c75-8de5-0c5ec13e5d0b', 'How is the CS program at VT?', 
'Hello I am paul rudd and I am curious about the computer science program at VT. If there are any CS majors that study or studied at VT could you tell me about the program? 
What are the hardest classes? What do you study?', '03057324-6eee-11ee-95c8-96fc48e250ac', '2024-03-15 10:30:00', '2024-03-17 09:15:00'),
('69088a97-b37a-4bd7-a5e0-df486656a888', 'Interested in AI', 'Hey everyone, I\'m a senior in high school and I\'m applying to schools right now. 
I think I\'m interested in studying AI. What schools have the best programs for an AI focused CS degree? THanks!', 
'153cc18b-6eee-11ee-95c8-96fc48e250ac', '2024-03-15 12:45:00', '2024-03-17 14:20:00');
UNLOCK TABLES;

-- Create comment table for forums
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `CommentID` varchar(36) NOT NULL DEFAULT (uuid()),
  `Text` varchar(10000) NOT NULL,
  `PostID` varchar(36) NOT NULL,
  `UserID` varchar(36) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT (NOW()),
  PRIMARY KEY (`CommentID`),
  KEY `PostID` (`PostID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Comment_creator` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `Comment_post` FOREIGN KEY (`PostID`) REFERENCES `post` (`PostID`)
);

-- Insert dummy data into comment table
LOCK TABLES `comment` WRITE;
INSERT INTO `comment` VALUES ('de0e7178-1fee-4fb5-92ff-6c6029671207', 'I\'m a CS major at VT and I enjoy it. 
The hardest and most infamous class is called systems, and it has a heavy focus on lower level programming. I\'d say that\'s actually a theme of VT CS classes. 
There\'s a focus on lower level programming overall (not that there arent classes with different focuses)', 
'acfa0103-9a30-4c75-8de5-0c5ec13e5d0b', '09112b8c-6eed-11ee-95c8-96fc48e250ac', '2024-03-17 09:15:00'),
('65644071-a974-45f7-8cc9-b5fac273934c', 'I think University of Rhode Island has a good program for someone interested in AI. Ask paul rudd though he owuld know more about this.',
'69088a97-b37a-4bd7-a5e0-df486656a888', '2382da03-6eed-11ee-95c8-96fc48e250ac', '2024-03-17 14:20:00');
UNLOCK TABLES;

-- Set the delimiter to // since we need to use semicolons in the trigger
DELIMITER //
-- Update the LastUpdated field in the post table when a new comment is posted
CREATE TRIGGER update_post_last_updated AFTER INSERT ON `comment`
FOR EACH ROW
BEGIN
    UPDATE `post`
    SET `LastUpdated` = NEW.`CreatedAt`
    WHERE `PostID` = NEW.`PostID`;
END;
//
-- Change the delimiter back to semicolon
DELIMITER ;

-- Create tag table to store post tags
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `TagID` varchar(36) NOT NULL DEFAULT (uuid()),
  `PostID` varchar(36) NOT NULL,
  `Tag` varchar(50) NOT NULL,
  PRIMARY KEY (`TagID`),
  CONSTRAINT `Tag_post` FOREIGN KEY (`PostID`) REFERENCES `post` (`PostID`)
);

-- Insert dummy data into tag table
LOCK TABLES `tag` WRITE;
INSERT INTO `tag` VALUES ('8343f8db-6a1f-4b87-999e-692c29d672e5', 'acfa0103-9a30-4c75-8de5-0c5ec13e5d0b', 'Virginia Tech'),
('18b1a233-621a-40a9-ad6c-489823d6dd18', 'acfa0103-9a30-4c75-8de5-0c5ec13e5d0b', 'Computer Science'),
('525e20a9-2ec0-4496-91e0-1685003170d4', '69088a97-b37a-4bd7-a5e0-df486656a888', 'AI'),
('d400cad8-ff70-4348-b1ee-2f13d1f6f36e', '69088a97-b37a-4bd7-a5e0-df486656a888', 'Applying to Schools');
UNLOCK TABLES;

-- Create color table to store tag colors
DROP TABLE IF EXISTS `color`;
CREATE TABLE `color` (
  `Tag` varchar(36) NOT NULL,
  `Color` varchar(7) NOT NULL,
  PRIMARY KEY (`Tag`)
);

-- Insert dummy data into color table
LOCK TABLES `color` WRITE;
INSERT INTO `color` VALUES ('Virginia Tech', '#c25f02'),
('Computer Science', '#30e004'),
('AI', '#b23ac2'),
('Applying to Schools', '#ccc041');
UNLOCK TABLES;

-- Create friend request table 
DROP TABLE IF EXISTS `friend_request`;
CREATE TABLE `friend_request` (
  `RequestID` varchar(36) NOT NULL DEFAULT (uuid()),
  `FromUser` varchar(36) NOT NULL,
  `ToUser` varchar(36) NOT NULL,
  PRIMARY KEY (`RequestID`),
  CONSTRAINT `FromUser` FOREIGN KEY (`FromUser`) REFERENCES `user` (`UserID`),
  CONSTRAINT `ToUser` FOREIGN KEY (`ToUser`) REFERENCES `user` (`UserID`)
);

-- Create example friend request
-- From Zarina to Paul Rudd
LOCK TABLES `friend_request` WRITE;
INSERT INTO `friend_request` VALUES ('d47f120b-a703-4b55-8600-91c90220a1fc', '153cc18b-6eee-11ee-95c8-96fc48e250ac', '03057324-6eee-11ee-95c8-96fc48e250ac');
UNLOCK TABLES;

-- Create friend table 
DROP TABLE IF EXISTS `friend`;
CREATE TABLE `friend` (
  `FriendID` varchar(36) NOT NULL DEFAULT (uuid()),
  `User1` varchar(36) NOT NULL,
  `User2` varchar(36) NOT NULL,
  PRIMARY KEY (`FriendID`),
  CONSTRAINT `User1` FOREIGN KEY (`User1`) REFERENCES `user` (`UserID`),
  CONSTRAINT `User2` FOREIGN KEY (`User2`) REFERENCES `user` (`UserID`)
);

-- Create example friend
-- Between Nancy Wheeler and Paul Rudd
LOCK TABLES `friend` WRITE;
INSERT INTO `friend` VALUES ('9b4f84b7-f737-4a56-b176-c87fee4c0502', '1798bce1-6eed-11ee-95c8-96fc48e250ac', '03057324-6eee-11ee-95c8-96fc48e250ac');
UNLOCK TABLES;

DROP TABLE IF EXISTS `chat_room`;
CREATE TABLE `chat_room` (
  `RoomID` varchar(36) NOT NULL DEFAULT (uuid()),
  `User1` varchar(36) NOT NULL,
  `User2` varchar(36) NOT NULL,
  `LastUpdated` datetime DEFAULT (NOW()),
  PRIMARY KEY (`RoomID`),
  CONSTRAINT `RoomUser1` FOREIGN KEY (`User1`) REFERENCES `user` (`UserID`),
  CONSTRAINT `RoomUser2` FOREIGN KEY (`User2`) REFERENCES `user` (`UserID`)
);

LOCK TABLE `chat_room`;
INSERT INTO `chat_room` VALUES ('a4af7e4b-4f65-443d-b408-a1bd61eed098', '03057324-6eee-11ee-95c8-96fc48e250ac', '153cc18b-6eee-11ee-95c8-96fc48e250ac', '2024-03-17 14:20:00');
UNLOCK TABLES;

DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE `chat_message` (
  `MessageID` varchar(36) NOT NULL DEFAULT (uuid()),
  `RoomID` varchar(36) NOT NULL,
  `UserID` varchar(36) NOT NULL,
  `Message` varchar(1000) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT (NOW()),
  PRIMARY KEY (`MessageID`),
  CONSTRAINT `MessageUserID` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `MessageRoomID` FOREIGN KEY (`RoomID`) REFERENCES `chat_room` (`RoomID`)
);

-- Set the delimiter to // since we need to use semicolons in the trigger
DELIMITER //
-- Update the LastUpdated field in the chat room table when a new message is sent
CREATE TRIGGER update_room_last_updated AFTER INSERT ON `chat_message`
FOR EACH ROW
BEGIN
    UPDATE `chat_room`
    SET `LastUpdated` = NEW.`CreatedAt`
    WHERE `RoomID` = NEW.`RoomID`;
END;
//
-- Change the delimiter back to semicolon
DELIMITER ;

LOCK TABLE `chat_message`;
INSERT INTO `chat_message` VALUES ('534579a4-fbf3-4045-b0df-9b46c5420267', 'a4af7e4b-4f65-443d-b408-a1bd61eed098', '153cc18b-6eee-11ee-95c8-96fc48e250ac', 'Hi Paul', '2024-03-17 14:19:00'),
('fd44eec5-f72c-4120-add7-c138f928caed', 'a4af7e4b-4f65-443d-b408-a1bd61eed098', '03057324-6eee-11ee-95c8-96fc48e250ac', 'Whats up?', '2024-03-17 14:20:00');
UNLOCK TABLES;