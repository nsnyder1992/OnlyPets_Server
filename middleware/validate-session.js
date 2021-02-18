const jwt = require("jsonwebtoken");
const User = require("../db").import("../models/user");

const validateSession = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(403)
      .send({ auth: false, message: "Please provide token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodeToken) => {
    if (err || !decodeToken) {
      res.errors = err;
      return res.status(500).json({ error: err, message: "Not Authorized" });
    }

    User.findOne({
      where: {
        id: decodeToken.id,
      },
    })
      .then((user) => {
        if (!user) throw err;
        req.user = user;
        return next();
      })
      .catch((err) => next(err));
  });
};

module.exports = validateSession;
