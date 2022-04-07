CREATE TABLE user (
  user_id int AUTO_INCREMENT,
  email varchar (50) UNIQUE NOT NULL,
  password varchar(70) NOT NULL,
  last_name varchar(10) NOT NULL,
  first_name varchar (10) NOT NULL,
  profile longblob,
  removed boolean DEFAULT 0,
  PRIMARY KEY(user_id)
);