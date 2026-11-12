const jwt = require("jsonwebtoken");

exports.protect = (...roles) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user.id || !user.role) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    const userRole = user.role.toLowerCase();

    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({
        message: "You are not authorized to access this resource.",
      });
    }

    req.user = {
      id: user.id,
      role: userRole,
    };

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Session expired or invalid. Please log in again.",
    });
  }
};