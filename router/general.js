const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || username.length == 0) {
    return res.status(400).json({message: "No username provided"});
  }
  if (!password || password.length == 0) {
    return res.status(400).json({message: "No password provided"});
  }
  if (!isValid(username)) {
    return res.status(400).json({message: "This username is taken."});
  }
  users.push({username: username, password: password });
  return res.status(201).json({message: "Username " + username + " has been registered!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    resolve(JSON.stringify(books, null, 4));
  })
  promise
  .then((data) => {
    res.send(data);
  })
   .catch((error) => {
    res.status(400).json({message: "Invalid request: " + error});
   });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
      reject("Book with ISBN " + isbn + " not found");
    }
    resolve(JSON.stringify(book, null, 4));
  });
  promise
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    res.status(404).json({message: error});
  })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const author_books = Object.fromEntries(Object.entries(books).filter(([isbn, book]) => {
      return book.author === req.params.author;
    }));
    if (Object.keys(author_books).length == 0) {
      reject("No books found.");
    }
    resolve(JSON.stringify(author_books, null, 4));
  });
  promise
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    res.status(404).json({message: error});
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const title_books = Object.fromEntries(Object.entries(books).filter(([isbn, book]) => {
      return book.title === req.params.title;
    }));
    if (Object.keys(title_books).length == 0) {
      reject("No books found.");
    }
    resolve(JSON.stringify(title_books, null, 4));
  });
  promise
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    res.status(404).json({message: error});
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "No book with specified ISBN exists."});
  }
  return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

module.exports.general = public_users;
