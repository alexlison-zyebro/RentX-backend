
export const isSeller = (req, res, next) => {

  if (!req.user?.role?.includes("SELLER")) {

    return res.status(403).json({

      message: "Seller access required"

    });
  }
  next();
};
