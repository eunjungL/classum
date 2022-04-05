CREATE TABLE chat (
  chat_id int AUTO_INCREMENT,
  post_id int NOT NULL ,
  content text NOT NULL,
  writer int NOT NULL ,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  anonymity boolean DEFAULT false,
  is_reply boolean DEFAULT false,
  reply_group int,
  removed boolean DEFAULT false,
  PRIMARY KEY (chat_id),
  FOREIGN KEY (post_id) REFERENCES post(post_id),
  FOREIGN KEY (writer) REFERENCES user(user_id),
  FOREIGN KEY (reply_group) REFERENCES chat(chat_id)
);