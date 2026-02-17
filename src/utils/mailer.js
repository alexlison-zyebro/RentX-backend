import nodemailer from "nodemailer";

export const sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter.sendMail({
    from: `RentX <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};