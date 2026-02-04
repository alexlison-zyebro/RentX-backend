export const isAdmin = (req, res, next) => {
  try {
    const userRoles = req.user?.roles || req.user?.role || [];
    
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