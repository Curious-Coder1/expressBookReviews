const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user) => user.username === username && user.password === password);
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in: Username and password required" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT token valid for 1 hour
        let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });

        // Save session credentials
        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(404).json({ message: "Invalid Login. Check username and password" });
    }
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization['username'];

    if (!review) {
        return res.status(400).json({ message: "Review content is required in query parameter" });
    }

    if (books[isbn]) {
        // Add or overwrite the user's review under the book's reviews object
        books[isbn].reviews[username] = review;
        return res.status(200).json({ 
            message: `The review for the book with ISBN ${isbn} has been added/updated.`,
            reviews: books[isbn].reviews 
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }

  //return res.status(300).json({message: "Yet to be implemented"});
});

// Delete a book review posted by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];

    if (books[isbn]) {
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({ 
                message: `Review for the ISBN ${isbn} posted by user ${username} deleted.` 
            });
        } else {
            return res.status(404).json({ message: "No review found for this user under the specified ISBN" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
