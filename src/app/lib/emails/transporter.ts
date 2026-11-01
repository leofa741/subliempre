import nodemailer from "nodemailer";

export const emailTransporter = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE || 'gmail',
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_SECRET_KEY,
  },
});