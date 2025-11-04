exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: You don't have permission" });
      }
      next();
    };
  };
  

//   eg. of how to use the middleware in a route file 
// authorizeRoles("admin", "ChefLover")