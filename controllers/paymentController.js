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

//   } catch (error) {
//     console.error("❌ Error while creating order:");
//     if (error.response) {
//       console.error("Response data:", error.response.data);
//       console.error("Status:", error.response.status);
//       console.error("Headers:", error.response.headers);
//     } else if (error.request) {
//       console.error("No response received. Request:", error.request);
//     } else {
//       console.error("Error message:", error.message);
//     }
//     return res.status(500).json({ error: 'Failed to get payment URL from server.' });
//   }
// };
    


// exports.jioPGCallback = async (req, res) => {
//   console.log("📥 Received PayPhi Callback Body:", req.body);

//     res.status(200).send("OK");


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

let lastTransaction = null;

// Create payment order
exports.createOrder = async (req, res) => {
  const amount = req.body.amount;
  const txnId = "TXN" + Date.now();
  const currencyCode = "356";
  const payType = "0";
  const transactionType = "SALE";
  const txnDate = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);

  const returnURL = "http://13.235.80.49:3000/jioPGCallback";

  const data = {
    merchantId: MERCHANT_ID,
    merchantTxnNo: txnId,
    amount: amount,
    currencyCode,
    payType,
    customerEmailID: "",
    transactionType,
    txnDate,
    returnURL,
    customerName: "",
    customerMobileNo: "",
    accountNo: "",
  };

  const sortedKeys = Object.keys(data).sort();
  let hashString = "";
  sortedKeys.forEach((key) => {
    hashString += data[key];
  });
  hashString += SECRET_KEY;

  const hash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  data.secureHash = hash;

  try {
    const response = await axios.post(
      "https://uat.paynimo.com/api/paynimoV2.req",
      qs.stringify({
        request: JSON.stringify(data),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const responseData = response.data;

    if (responseData?.response?.redirectUrl) {
      // Save transaction to DB
      await db.query(
        "INSERT INTO transactions (merchantTxnNo, transactionId, amount, responseCode, status) VALUES (?, ?, ?, ?, ?)",
        [txnId, "-", amount, "-", "PENDING"]
      );

      lastTransaction = {
        merchantTxnNo: txnId,
        amount: amount,
      };

      res.json({ redirectUrl: responseData.response.redirectUrl });
    } else {
      res.json({
        message: "Failed to get payment URL",
        error: responseData,
      });
    }
  } catch (error) {
    console.error("❌ Payment creation error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Callback Handler from PayPhi
exports.jioPGCallback = async (req, res) => {
  try {
    const postData = req.body;
    console.log("📥 PayPhi Callback received:", postData);

    const { merchantTxnNo } = postData;

    if (!merchantTxnNo) {
      return res.render("result", {
        transactionId: "N/A",
        merchantTxnNo: "N/A",
        amount: "N/A",
        status: "Failed",
        responseCode: "N/A",
        message: "Missing transaction reference in callback",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE merchantTxnNo = ? ORDER BY created_at DESC LIMIT 1",
      [merchantTxnNo]
    );

    if (rows.length === 0) {
      return res.render("result", {
        transactionId: "N/A",
        merchantTxnNo,
        amount: "N/A",
        status: "Failed",
        responseCode: "N/A",
        message: "Transaction not found in database.",
      });
    }

    const txn = rows[0];

    res.render("result", {
      transactionId: txn.transactionId,
      merchantTxnNo: txn.merchantTxnNo,
      amount: txn.amount,
      status: txn.status,
      responseCode: txn.responseCode,
      message: "Payment processed.",
    });
  } catch (err) {
    console.error("❌ Error in callback:", err);
    res.render("result", {
      transactionId: "N/A",
      merchantTxnNo: "N/A",
      amount: "N/A",
      status: "Error",
      responseCode: "N/A",
      message: "An error occurred while processing the payment.",
    });
  }
};

// Last Transaction Viewer (Optional, can be removed)
exports.getLastTransaction = async (req, res) => {
  res.json(lastTransaction || { message: "No transaction yet." });
};
