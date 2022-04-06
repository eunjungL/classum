CREATE TABLE post_read (
    read_id int AUTO_INCREMENT,
    read_state int NOT NULL,
    post_id int NOT NULL,
    reader int NOT NULL,
    removed boolean DEFAULT false,
    PRIMARY KEY (read_id),
    FOREIGN KEY (post_id) REFERENCES post(post_id),
    FOREIGN KEY (reader) REFERENCES user(user_id)
);