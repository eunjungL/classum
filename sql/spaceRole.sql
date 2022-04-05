CREATE TABLE space_role (
  role_id int AUTO_INCREMENT,
  role_name varchar (10) NOT NULL,
  authority boolean DEFAULT false,
  space_id int NOT NULL,
  removed boolean DEFAULT false,
  PRIMARY KEY (role_id),
  FOREIGN KEY (space_id) REFERENCES space(space_id) ON DELETE CASCADE
);