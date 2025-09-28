import nodemailer from 'nodemailer';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendOTPEmail = async (email: string, firstName: string, otp: string): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Notes App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification - Notes App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Welcome to Notes App!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">Best regards,<br>The Notes App Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};