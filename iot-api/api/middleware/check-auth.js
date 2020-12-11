const jwt = require('jsonwebtoken');
const { MESSAGE } = require('../controllers/static');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.AuthData = decoded;
    return next();
  } catch (error) {
    return res.status(401).json(MESSAGE[401]);
  }
};
