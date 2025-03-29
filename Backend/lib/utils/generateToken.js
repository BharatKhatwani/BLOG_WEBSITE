const jwt = require('jsonwebtoken');

const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: '15d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return token; // 🔥 IMPORTANT - Return token
};

module.exports = generateTokenAndSetCookies;
