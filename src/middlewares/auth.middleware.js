import jwt from "jsonwebtoken";

export const authenticate = (req,res,next) => {

  const token = req.headers.token;

  if(!token){

    return res.status(401).json({
      status:"InvalidAuthentication",
      message:"Authentication token missing"
    });
  }

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    req.user = {

      id:decoded.userId,
      email:decoded.email,
      roles:decoded.roles
    };

    next();
    
  } catch (error) {

    return res.status(401).json({
      status: "InvalidToken",
      message:"Invalid or Expired Token"

    });
    
  }
}