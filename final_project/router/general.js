const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
    public_users.get('/', async function (req, res) {
        try {
            const getBooks = new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject("Failed to retrieve books list");
                }
            });

            const bookList = await getBooks;
            return res.status(200).send(JSON.stringify(bookList, null, 4));
        } catch (error) {
            return res.status(500).json({ message: error.message || error });
        }
    });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const findBookByISBN = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });

    findBookByISBN
        .then((book) => {
            return res.status(200).json(book);
        })
        .catch((error) => {
            return res.status(404).json({ message: error });
        });
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const matchingBooks = [];
            const keys = Object.keys(books);

            for (let key of keys) {
                if (books[key].author.toLowerCase() === author.toLowerCase()) {
                    matchingBooks.push(books[key]);
                }
            }

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject("No books found for this author");
            }
        });

        const authorBooks = await getBooksByAuthor;
        return res.status(200).json(authorBooks);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
    const matchingBooks = [];

    const keys = Object.keys(books);
    for (let key of keys) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            matchingBooks.push(books[key]);
        }
    }

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    }

    return res.status(404).json({ message: "No books found with this title" });
  //return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({ message: "Book not found" });
  //return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
