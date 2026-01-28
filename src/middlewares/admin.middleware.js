export const isAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        status: "AccessDenied",
        message: "Authentication required"
      });
    }

    const userRoles = req.user.roles;
    
    if (!userRoles.includes("ADMIN")) {
      return res.status(403).json({
        status: "AccessDenied",
        message: "Admin access required"
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      status: "ServerError",
      message: "Internal server error"
    });
  }
};