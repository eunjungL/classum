CREATE TABLE space (
  space_id int AUTO_INCREMENT,
  name varchar (30) NOT NULL,
  logo longblob,
  admin_code varchar (8) NOT NULL,
  user_code varchar (8) NOT NULL,
  admin int NOT NULL,
  removed boolean DEFAULT 0,
  PRIMARY KEY (space_id),
  FOREIGN KEY (admin) REFERENCES user(user_id) ON DELETE CASCADE
);