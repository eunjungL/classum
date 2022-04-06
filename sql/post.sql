CREATE TABLE post (
    post_id int AUTO_INCREMENT,
    title varchar(30) NOT NULL,
    content text NOT NULL,
    category boolean default false,
    space_id int NOT NULL,
    writer int NOT NULL ,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    file longblob,
    anonymity boolean DEFAULT false,
    state int DEFAULT 0,
    removed boolean DEFAULT false,
    PRIMARY KEY (post_id),
    FOREIGN KEY (space_id) REFERENCES space(space_id),
    FOREIGN KEY (writer) REFERENCES user(user_id)
);