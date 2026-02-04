export const isSeller = (req, res, next) => {
  const userRoles = req.user?.roles || req.user?.role || [];
  
  if (!userRoles.includes("SELLER")) {
    return res.status(403).json({
      message: "Seller access required"
    });
  }
  next();
};