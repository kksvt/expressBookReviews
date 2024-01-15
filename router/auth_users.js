const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.filter((user) => user.username === username).length == 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users
  .filter((user) => user.username === username && user.password === password)
  .length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || username.length == 0) {
    return res.status(400).json({message: "No username provided."});
  }
  if (!password || password.length == 0) {
    return res.status(400).json({message: "No password provided."});
  }
  if (!authenticatedUser(username, password)) {
    return res.status(400).json({message: "Invalid username or password."});
  }
  let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60 * 60});
  req.session.authorization = {accessToken, username};
  return res.status(200).json({message: "User successfully logged in."});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization['username'];
  const review_text = req.body.review;
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "No book with the specified ISBN exists."});
  }
  if (!review_text || review_text.length == 0) {
    return res.status(400).json({message: "Please provide a review text."});
  }
  const review_exists = book.reviews[username];
  book.reviews[username] = review_text;
  if (review_exists)
    return res.status(201).json({message: "Review updated."});
  return res.status(201).json({message: "Review added"});
});

//Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => { 
  const username = req.session.authorization['username'];
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "No book with the specified ISBN exists."});
  }
  if (book.reviews[username])
    delete book.reviews[username];
  return res.status(200).json({message: "Review removed."});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
