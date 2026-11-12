const jwt = require("jsonwebtoken");

exports.protect = (...roles) => (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Please log in" });
  }
};