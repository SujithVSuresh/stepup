//OTP function
const generateOtp = () => {
    const digits = '0123456789';
    let otpNumber = '';
    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * digits.length);
      otpNumber  += digits[index];
    }
    return otpNumber ;
  }

  module.exports = generateOtp