const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
if (req.session && req.session.authorization) {
        const token = req.session.authorization['accessToken'];

        // Verify the JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // Attach decoded user payload to request
                next();          // Proceed to the next middleware or route handler
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(404).json({ message: "User not logged in" });
    }

});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
