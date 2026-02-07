'use strict';

const jwt = require('jsonwebtoken');

// Secret key for JWT signing and encryption
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Middleware for JWT verification
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
};

module.exports = { authenticateJWT, generateToken };