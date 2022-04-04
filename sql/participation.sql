CREATE TABLE participation (
  participation_id int AUTO_INCREMENT,
  space_id int NOT NULL,
  user_id int NOT NULL,
  role int NOT NULL,
  removed boolean DEFAULT false,
  PRIMARY KEY (participation_id),
  FOREIGN KEY (space_id) REFERENCES space(space_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ,
  FOREIGN KEY (role) REFERENCES space_role(role_id) ON DELETE CASCADE
);