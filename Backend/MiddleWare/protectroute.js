const jwt = require('jsonwebtoken');
const {User} = require('../model/User_Model.js');

const protectroute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: You are not logged in"
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token"
      });
    }

    console.log(decoded.userId);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized: User does not exist"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

module.exports = protectroute;
