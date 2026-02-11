import User from "../models/User.js";
import Otps from "../models/Otp.js";
import { generateAndSaveOtp, verifyOtp } from "../services/otp.service.js";
import { sendMail } from "../utils/mailer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


/* SEND OTP */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = await generateAndSaveOtp(email);

    await sendMail(
      email,
      "RentX OTP Verification",
      `<h3>Your OTP is: ${otp}</h3>
       <p>This OTP is valid for 5 minutes.</p>`
    );

    res.json({ status: "SUCCESS", message: "OTP sent to email" });
  } catch (error){
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* VERIFY OTP */
export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!purpose) {
      return res.status(400).json({
        message: "OTP purpose is required"
      });
    }

    const isValid = await verifyOtp(email, otp, purpose);

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    res.json({
      status: "SUCCESS",
      message: "OTP verified successfully"
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: "OTP verification failed"
    });
  }
};


/* REGISTER USER */

export const registerUser = async (req, res) => {
  try {
    const { email, phone, address, buyerDetails, sellerDetails } = req.body;
    const verifiedOtp = await Otps.findOne({
      email,
      isVerified: true
    });

    if (!verifiedOtp) {
      return res.status(403).json({
        message: "Please verify OTP before registration"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already registered"
      });
    }

    if (sellerDetails?.sellerType === "INDIVIDUAL") {
      const { individualName, individualDob, aadhaarNumber } = sellerDetails;

      if (!individualName || !individualDob || !aadhaarNumber) {
        return res.status(400).json({
          message:
            "Individual seller requires name, date of birth and Aadhaar number"
        });
      }
    }

    if (sellerDetails?.sellerType === "ORGANIZATION") {
      const {
        organizationName,
        individualName,
        individualDob,
        aadhaarNumber
      } = sellerDetails;

      if (
        !organizationName ||
        !individualName ||
        !individualDob ||
        !aadhaarNumber
      ) {
        return res.status(400).json({
          message:
            "Organization seller requires organization name, owner name, date of birth and Aadhaar number"
        });
      }
    }

    const defaultPassword = Math.random().toString(36).slice(-8);

    let role = ["BUYER"];
    let status = "ACTIVE";

    if (sellerDetails?.sellerType) {
      status = "PENDING";
      role =
        sellerDetails.sellerType === "INDIVIDUAL"
          ? ["BUYER", "SELLER"]
          : ["SELLER"];
    }

    const hashedPassword = await bcrypt.hash(defaultPassword,10);

    await User.create({
      role,
      email,
      phone,
      password: hashedPassword,
      isEmailVerified: true,
      status,
      address,
      buyerDetails,
      sellerDetails
    });

    await Otps.deleteMany({ email });

    const isSeller = status === "PENDING";

    const emailSubject = isSeller
      ? "RentX Seller Account Request Received"
      : "RentX Account Created";

    const emailBody = isSeller
      ? `
        <h3>Seller Account Request Submitted</h3>
        <p>Your <b>Seller Account Creation request</b> is currently <b>under processing</b>.</p>
        <p>After confirmation from the admin, you can login using the below credentials:</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${defaultPassword}</p>
        <p>Please do not share your credentials with anyone.</p>
      `
      : `
        <h3>Welcome to RentX</h3>
        <p>Your account has been created successfully.</p>
         <p>Login to Your Account Using the Below Login Credentials.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${defaultPassword}</p>
        <p>Please change your password after login.</p>
      `;

    await sendMail(email, emailSubject, emailBody);

    res.status(201).json({
      status: "SUCCESS",
      message:
        status === "PENDING"
          ? "Seller registered. Waiting for admin approval."
          : "Buyer registered successfully"
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};


//Login

export const loginUser = async (req,res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({email});

    if(!user)
    {
      return res.status(401).json({
        status:"Invalid Email",
        message:"Invalid email Id"
      });
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch)
    {
      return res.status(401).json({

        status:"PasswordNotMatch",
        message:"Invalid Password"
      })
    }

     if (user.status === "INACTIVE") {
      return res.status(403).json({
        status: "UserInactive",
        message: "Account is inactive"
      });
    }

    if (user.status === "PENDING") {
      return res.status(403).json({
        status: "accountPendingStatus",
        message: "Seller account pending admin approval"
      });
    }

    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      roles: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn : "2d" }
  
  );

  res.json({
    status:"SUCCESS",
    message:"Login Successfull",
    token,
    userId: user._id,
    email: user.email,
    roles: user.role
  });
    
  } catch (error) {
    
    console.error("Login error:", error);
    res.status(500).json({
      status: "FAILED",
      message: "Login failed"
    });
    
  }
};