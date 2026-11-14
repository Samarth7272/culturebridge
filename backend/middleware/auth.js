const jwt = require("jsonwebtoken");

exports.protect = (...roles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Please log in first.",
        });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (!decoded.id || !decoded.role) {
        return res.status(401).json({
          message: "Invalid login token.",
        });
      }

      const userRole = String(decoded.role)
        .toLowerCase()
        .trim();

      const allowedRoles = roles.map((role) =>
        role.toLowerCase().trim()
      );

      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(userRole)
      ) {
        return res.status(403).json({
          message: "You are not authorized to perform this action.",
        });
      }

      req.user = {
        ...decoded,
        role: userRole,
      };

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired login session.",
      });
    }
  };
};