// const axios = require("axios");
// const crypto = require("crypto");
// const db = require("../db/dbConnection");
// const qs = require("querystring");
// const path = require("path");


// const MERCHANT_ID = "JP2000000000031";
// const SECRET_KEY = "abc";

// let lastTransaction = null;

// exports.createOrder = async (req, res) => {
//   const amount = req.body.amount;
//   const txnId = "TXN" + Date.now();

//   const payload = {
//     merchantId: MERCHANT_ID,
//     merchantTxnNo: txnId,
//     amount: amount,
//     currencyCode: "356",
//     payType: "0",
//     customerEmailID: "",
//     transactionType: "SALE",
//     txnDate: getCurrentYmdHis(),
//     returnURL: "http://13.235.80.49:3000/jioPGCallback",
//     customerMobileNo: "",
//     addlParam1: "RES123456789",
//     addlParam2: "",
//   };

//   // Generate secureHash
//   const sortedKeys = Object.keys(payload).sort();
//   let message = "";
//   for (const key of sortedKeys) {
//     const value = payload[key];
//     if (value !== null && value !== "") {
//       message += value;
//     }
//   }

//   const hash = crypto
//     .createHmac("sha256", SECRET_KEY)
//     .update(message)
//     .digest("hex")
//     .toLowerCase();

//   payload.secureHash = hash;

//   try {
//     const response = await axios.post(
//       "https://uat.jiopay.co.in/tsp/pg/api/v2/initiateSale",
//       payload,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     console.log("✅ PayPhi Response:", response.data);

//     if (response.data.responseCode === "R1000" && response.data.redirectURI) {
//       res.json({
//         redirectUrl:
//           response.data.redirectURI + "?tranCtx=" + response.data.tranCtx,
//       });
//     } else {
//       res.status(400).json({
//         error: "PayPhi did not return redirect URL",
//         details: response.data,
//       });
//     }
//   } catch (err) {
//     console.error("❌ PayPhi API Error:", err?.response?.data || err.message);
//     res.status(500).json({ error: "Failed to initiate PayPhi payment" });
//   }
// };

// exports.jioPGCallback = async (req, res) => {
//   console.log("📥 Received PayPhi Callback Body:", req.body);

//   const { merchantTxnNo, tranId, amount, responseCode, responseMessage } = req.body;

//   const success = responseCode === "0000";
//   const statusText = success ? "Successful" : "Failed";
//   console.log(`📢 Payment Status for txn ${merchantTxnNo}: ${statusText}`);

//   lastTransaction = {
//     merchantTxnNo,
//     amount,
//     responseCode,
//     responseMessage,
//     status: statusText,
//   };

//   try {
//     await db.execute(
//       `INSERT INTO transactions (merchantTxnNo, amount, responseCode, status) VALUES (?, ?, ?, ?)`,
//       [merchantTxnNo, amount, responseCode, statusText]
//     );
//     console.log("✅ Transaction saved to database.");
//   } catch (err) {
//     console.error("❌ DB Insert Error:", err.message);
//   }

//   // ✅ Fetch and log PayPhi status API
//   try {
//     const payload = {
//       merchantId: MERCHANT_ID,
//       merchantTxnNo: merchantTxnNo,
//       transactionType: "SALE"
//     };

//     const sortedKeys = Object.keys(payload).sort();
//     let message = "";
//     for (const key of sortedKeys) {
//       const value = payload[key];
//       if (value !== null && value !== "") {
//         message += value;
//       }
//     }

//     const hash = crypto
//       .createHmac("sha256", SECRET_KEY)
//       .update(message)
//       .digest("hex")
//       .toLowerCase();

//     payload.secureHash = hash;

//     const statusResponse = await axios.post(
//       "https://uat.jiopay.co.in/tsp/pg/api/command",
//       payload,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     console.log("📡 Status API Response:", statusResponse.data);
//   } catch (statusErr) {
//     console.error("❌ PayPhi Status API Error:", statusErr?.response?.data || statusErr.message);
//   }

// res.render("paymentResult", {
//   merchantTxnNo,
//   amount,
//   responseCode,
//   responseMessage,
//   status: statusText,
//   statusClass: success ? "success" : "fail",
//   statusMessage: success ? "✅ Payment Successful!" : "❌ Payment Failed!"
// });
// };

// exports.checkStatus = (req, res) => {
//   if (!lastTransaction) {
//     return res.send("❌ No transaction found yet.");
//   }

//   const {
//     merchantTxnNo,
//     amount,
//     responseCode,
//     responseMessage,
//     status: statusText,
//   } = lastTransaction;

// res.render("checkStatusPage", {
//   merchantTxnNo,
//   amount,
//   responseCode,
//   responseMessage,
//   statusText,
// });
// };


// exports.fetchPayPhiStatus = async (req, res) => {
//   const { merchantTxnNo } = req.body;

//   if (!merchantTxnNo) {
//     return res.status(400).json({ error: "Missing merchantTxnNo in request body" });
//   }

//   const payload = {
//     merchantId: MERCHANT_ID,
//     merchantTxnNo: merchantTxnNo,
//     transactionType: "SALE"
//   };

//   const sortedKeys = Object.keys(payload).sort();
//   let message = "";
//   for (const key of sortedKeys) {
//     const value = payload[key];
//     if (value !== null && value !== "") {
//       message += value;
//     }
//   }

//   const hash = crypto
//     .createHmac("sha256", SECRET_KEY)
//     .update(message)
//     .digest("hex")
//     .toLowerCase();

//   payload.secureHash = hash;

//   try {
//     const statusResponse = await axios.post(
//       "https://uat.jiopay.co.in/tsp/pg/api/txnStatus",
//       payload,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     console.log("📡 Manual Status API Response:", statusResponse.data);
//     res.json(statusResponse.data);
//   } catch (err) {
//     console.error("❌ PayPhi Status API Error:", err?.response?.data || err.message);
//     res.status(500).json({ error: "Failed to fetch transaction status" });
//   }
// };

// // Utility
// function getCurrentYmdHis() {
//   const now = new Date();
//   const Y = now.getFullYear();
//   const m = String(now.getMonth() + 1).padStart(2, "0");
//   const d = String(now.getDate()).padStart(2, "0");
//   const H = String(now.getHours()).padStart(2, "0");
//   const i = String(now.getMinutes()).padStart(2, "0");
//   const s = String(now.getSeconds()).padStart(2, "0");
//   return `${Y}${m}${d}${H}${i}${s}`;
// }
















const axios = require("axios");
const crypto = require("crypto");
const db = require("../db/dbConnection");
const qs = require("querystring");

const MERCHANT_ID = "JP2000000000031";
const SECRET_KEY = "abc"; // replace with your actual secret key

// Last transaction tracker
let lastTransaction = null;

// Create payment order
exports.createOrder = async (req, res) => {
  const amount = req.body.amount;
  const txnId = "TXN" + Date.now();

  // Save for later use
  lastTransaction = {
    txnId: txnId,
    amount: amount,
  };

  const txnDate = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14); // Format: YYYYMMDDHHMMSS

  const payload = {
    merchantId: MERCHANT_ID,
    merchantTxnNo: txnId,
    amount: amount,
    currencyCode: "356",
    payType: "0",
    transactionType: "SALE",
    txnDate: txnDate,
    returnURL: "http://13.235.80.49:3000/jioPGCallback", // Replace with your actual EC2 public IP/domain
  };

  // Generate secure hash
  const sortedKeys = Object.keys(payload).sort();
  const sortedData = sortedKeys.map((key) => payload[key]).join("|");
  const hash = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(sortedData)
    .digest("hex");

  payload.secureHash = hash;

  try {
    const response = await axios.post(
      "https://uat.payphi.com/payment/api/paymentrequest",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.redirect(response.data.paymentUrl);
  } catch (error) {
    console.error("Error in createOrder:", error.message);
    return res.status(500).json({ error: "Payment request failed" });
  }
};

// Payment result callback handler
exports.jioPGCallback = async (req, res) => {
  try {
    const {
      merchantTxnNo,
      responseCode,
      respDescription,
      merchantId,
      amount,
    } = req.body;

    const status = responseCode === "E000" ? "Success" : "Failed";

    // Insert transaction details into database
    await db.query(
      `INSERT INTO transactions (merchantTxnNo, amount, responseCode, status, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [merchantTxnNo, amount || 0, responseCode, status]
    );

    // Respond with JSON
    return res.status(200).json({
      success: true,
      message: "Payment processed",
      transactionDetails: {
        merchantId,
        merchantTxnNo,
        responseCode,
        respDescription,
        status,
      },
    });
  } catch (error) {
    console.error("Error in jioPGCallback:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Optional: Check last status (if needed)
exports.getLastTransactionStatus = (req, res) => {
  if (!lastTransaction) {
    return res.status(404).json({ message: "No transaction found" });
  }
  res.json(lastTransaction);
};
