import dotenv from "dotenv";
import Razorpay from "razorpay";

// Load environment variables
dotenv.config();

console.log("Testing Razorpay connection...");
console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Key Secret exists:", !!process.env.RAZORPAY_KEY_SECRET);

try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  // Test by creating a simple order
  razorpay.orders.create({
    amount: 10000, // 100 rupees in paise
    currency: "INR",
    receipt: "test_receipt",
  })
    .then(response => {
      console.log("✅ Razorpay connection successful!");
      console.log("Order ID:", response.id);
    })
    .catch(error => {
      console.error("❌ Razorpay connection failed:");
      console.error("Error:", error.error);
      console.error("Status Code:", error.statusCode);
    });
} catch (error) {
  console.error("❌ Razorpay initialization failed:", error.message);
}
