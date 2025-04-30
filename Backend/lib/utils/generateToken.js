const jwt = require('jsonwebtoken');

const generateTokenandSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
        expiresIn: '15d'
    });

    // Set the JWT token in the cookie
    res.cookie('jwt', token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
        httpOnly: true,                  // Prevents client-side JS from accessing the cookie
        sameSite: "strict",              // Prevents CSRF attacks
        secure: process.env.NODE_ENV === 'production' // Ensures HTTPS in production
    });

    // Optionally log that the cookie was set (for debugging purposes)
    console.log("Cookie has been set with JWT.");

    // Return the token to include it in the response body
    console.log("Token",  token)
    return token;
};

module.exports = generateTokenandSetCookie;


/*
Purpose: You are creating a JSON Web Token (JWT) with the jwt.sign() method.

Payload: It contains userId, which uniquely identifies the user.

Secret Key: You are signing it with the secret key stored in process.env.JWT_SECRET.

Expiration: The token is set to expire in 15 days with expiresIn: '15d'.

JWTs are stateless, meaning the server doesn’t need to keep track of user sessions or store any session information. Once issued, the JWT can be used for authentication in future requests without needing to check the server.
*/ 