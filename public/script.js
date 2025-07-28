document.addEventListener("DOMContentLoaded", function () {
  const payPhiBtn = document.getElementById("payPhiBtn");

  if (payPhiBtn) {
    payPhiBtn.addEventListener("click", async function () {
      const amount = document.getElementById("amount").value;

      if (!amount || amount <= 0) {
        alert("⚠️ Please enter a valid amount.");
        return;
      }

      try {
        const res = await fetch("/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const data = await res.json();

        console.log(data);

        if (data.redirectUrl) {
          window.open(data.redirectUrl, "_blank");
        } else {
          alert("❌ Failed to get payment URL from server.");
          console.error("Server response:", data);
        }
      } catch (error) {
        alert("❌ Error while contacting server.");
        console.error("PayPhi button error:", error);
      }
    });
  }
});
