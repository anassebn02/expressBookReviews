const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let authenticatedUser = require("./auth_users.js").authenticatedUser;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/login",async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {

    let accessToken =await jwt.sign({
      data: password
    }, 'SECRET_KEY', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).json({message : "User successfully logged in" ,accessToken});
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

public_users.post("/register",async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) { 
      await users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  return await res.status(300).json({books: books});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  let isbn = parseInt(req.params.isbn) ;
  let book = books[isbn]
  if(!book)
    return res.status(404).json({error : 'there is no book with this number '+isbn}) 
  return await res.status(300).json({book: book});
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  let author = req.params.author ; 
  let booksArray = Object.values(books) ;
  let bookByAuthor = await booksArray.filter((book)=>book.author === author) ;
  if(!bookByAuthor.length)
    return res.status(404).json({error :'author doesn"t exists'}) ;
  return await res.status(300).json({book: bookByAuthor});
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  let title = req.params.title ; 
  let booksArray = Object.values(books) ;
  let bookByTitle = await booksArray.filter((book)=>book.title === title) ;
  if(!bookByTitle.length)
    return res.status(404).json({error :'title doesn"t exists'}) ;
  return res.status(300).json({book: bookByTitle});
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
  let isbn = parseInt(req.params.isbn) ;
  let book = books[isbn]
  if(!book)
    return res.status(404).json({error : 'there is no book with this number '+isbn}) 
  return await res.status(300).json({bookReviews: book.reviews});
});

module.exports.general = public_users;
