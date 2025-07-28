// service/razorpayService.js
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_j3dYWKRUu4qxU8",
  key_secret: "eKKbsdD2olnjMVbdkv7Cpkmm",
});

const createOrder = async (amount) => {
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

const fetchPayment = async (paymentId) => {
  return await razorpay.payments.fetch(paymentId);
};

module.exports = {
  createOrder,
  fetchPayment,
};
