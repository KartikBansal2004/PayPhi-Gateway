const crypto = require("crypto");
const db = require("../db/dbConnection");
const Razorpay = require("razorpay");
require("dotenv").config();

// ✅ Webhook Route Handler
exports.handleWebhook = (req, res) => {
  const secret = "Mayank@CEO";

  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.warn("❌ Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === "payment.captured") {
    const payment = payload.payment.entity;

    const updateQuery = `
      UPDATE orders
      SET payment_status = 'Paid', amount = ?, created_at = NOW()
      WHERE order_id = ?
    `;

    db.query(updateQuery, [payment.amount, payment.order_id], (err) => {
      if (err) {
        console.error("❌ DB Update Error:", err);
        return res.status(500).send("DB update failed");
      }

      console.log("✅ Payment updated via webhook:", payment.id);
      res.status(200).send("Payment captured");
    });
  } else if (event === "payment.failed") {
    const payment = payload.payment.entity;

    const updateQuery = `
      UPDATE orders
      SET payment_status = 'Failed', created_at = NOW()
      WHERE order_id = ?
    `;

    db.query(updateQuery, [payment.order_id], (err) => {
      if (err) {
        console.error("❌ DB Update Error:", err);
        return res.status(500).send("DB update failed");
      }

      console.log("⚠️ Payment failed via webhook:", payment.id);
      res.status(200).send("Payment failed");
    });
  } else {
    res.status(200).send("Unhandled event");
  }
};

const razorpay = new Razorpay({
  key_id: "rzp_test_j3dYWKRUu4qxU8",
  key_secret: "eKKbsdD2olnjMVbdkv7Cpkmm",
});

exports.verifyPayment = async (req, res) => {
  const { razorpay_payment_id } = req.body;
  console.log("🔍 Verifying payment ID:", razorpay_payment_id);

  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log("✅ Payment fetched:", payment);

    if (payment.status === "captured") {
      const updateQuery = `
        UPDATE orders
        SET payment_status = ?, amount = ?, created_at = NOW()
        WHERE order_id = ?
      `;

      db.query(
        updateQuery,
        ["Paid", payment.amount, payment.order_id],
        (err) => {
          if (err) {
            console.error("❌ DB Update Error:", err);
            return res
              .status(500)
              .json({ success: false, message: "DB update failed" });
          }

          // ✅ Respond without exposing email/contact
          res.json({
            success: true,
            message: "Payment verified successfully",
            data: {
              // payment_id: payment.id,
              // order_id: payment.order_id,
              status: payment.status,
              method: payment.method,
              amount: payment.amount / 100,
            },
          });
        }
      );
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not captured",
        status: payment.status,
      });
    }
  } catch (err) {
    console.error("❌ Razorpay Verification Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: err.message,
    });
  }
};
