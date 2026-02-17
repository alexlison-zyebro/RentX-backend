import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "InvalidAuthentication",
      message: "Authentication token missing"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
      role: decoded.roles  
    };

    // console.log("DEBUG - Authenticated user:", req.user);
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      status: "InvalidToken",
      message: "Invalid or Expired Token"
    });
  }
};