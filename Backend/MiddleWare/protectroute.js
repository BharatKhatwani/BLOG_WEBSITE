const jwt = require('jsonwebtoken');
const User = require('../model/User_Model.js');  // Corrected 'requrie' to 'require'

/*
    Middleware to protect routes by validating the JWT token.
*/

const protectedRoute = async (req, res, next) => {
    try {
        // Step 1: Extract JWT token from cookies
        const token = req.cookies.jwt;

        // Step 2: If no token is found, return Unauthorized error
        if (!token) {
            return res.status(401).json({
                message: "Token not provided"
            });
        }

        // Step 3: Decode and verify the JWT token
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Decoding and verifying token
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized, invalid token"
            });
        }

        // Step 4: Find the user from the decoded token's userId
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Step 5: Attach the user data to the request object so it's accessible in the route handler
        req.user = user;

        // Step 6: Allow the request to continue to the next middleware/route handler
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = {protectedRoute};
