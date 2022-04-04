CREATE TABLE space (
  space_id int AUTO_INCREMENT,
  name varchar (30) UNIQUE NOT NULL,
  logo longblob,
  admin_code varchar (8) NOT NULL,
  user_code varchar (8) NOT NULL,
  admin varchar (50) NOT NULL,
  removed boolean DEFAULT 0,
  PRIMARY KEY (space_id),
  FOREIGN KEY (admin) REFERENCES user(email) ON DELETE CASCADE
);