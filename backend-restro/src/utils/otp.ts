export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = (email: string, otp: string) => {
  // In production, integrate nodemailer or Twilio
  console.log(`OTP sent to ${email}: ${otp}`); // Mock
};
