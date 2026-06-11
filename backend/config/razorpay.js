const Razorpay = require('razorpay');

let razorpayInstance;

try {
  // Initialize Razorpay SDK.
  // If keys are dummy, it will still load, and we will handle mock responses in checkout controllers if actual API calls fail.
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysignaturesecretabc'
  });
} catch (error) {
  console.error("Razorpay Initialization Error: ", error.message);
}

module.exports = razorpayInstance;
