const mongoose = require('mongoose');

// Reject malformed ObjectIds with 400 before they reach the database.
const validateObjectId = (...params) => (req, res, next) => {
  for (const p of params) {
    if (!mongoose.isValidObjectId(req.params[p])) {
      return res.status(400).json({ message: `Invalid ${p}: ${req.params[p]}` });
    }
  }
  next();
};

module.exports = validateObjectId;
