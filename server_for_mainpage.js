import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import twilio from "twilio";
import itemRoutes from "./routes/items.js"; // ✅ Correct import
import authRoutes from "./routes/auth.js";
import User from "./models/User.js";
import Item from "./models/item.js";

const app = express();

// ✅ Configure CORS


app.use(cors({
    origin: "http://127.0.0.1:5500", // Adjust according to your frontend
    credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes); // ✅ Corrected (removed duplicate)

// ✅ Twilio Credentials (Environment Variables Recommended)
const TWILIO_ACCOUNT_SID = "AC72f0c702ff207654b2f9d6b540957996";
const TWILIO_AUTH_TOKEN = "db673dbfc0e25b16c8a706ba7815f94a";
const TWILIO_PHONE = "+18573494226";

const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/expiryTracker", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Function to Send Expiry SMS
async function checkExpiryAndSendSMS() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);

    console.log("🔍 Checking items expiring between:", today, "and", twoDaysLater);

    // Find expiring items
    const expiringItems = await Item.find({ expiryDate: { $gte: today, $lt: twoDaysLater } });

    if (expiringItems.length > 0) {
      for (const item of expiringItems) {
        const user = await User.findById(item.userId);
        if (!user) continue;

        const message = `⚠️ Reminder: Your item "${item.name}" expires on ${new Date(item.expiryDate).toLocaleDateString()}.`;
        console.log(`📢 Sending SMS for item: ${item.name} to ${user.phone}`);

        await client.messages.create({
          body: message,
          from: TWILIO_PHONE,
          to: user.phone,
        });

        console.log(`📩 SMS sent for item: ${item.name}`);
      }
    } else {
      console.log("✅ No items expiring in 2 days.");
    }
  } catch (error) {
    console.error("❌ Error checking expiry and sending SMS:", error);
  }
}

// ✅ Route to Manually Trigger SMS Check
app.get("/send-expiry-sms", async (req, res) => {
  const authMiddleware = (await import("./middleware/auth.js")).default; // ✅ Lazy-loaded to avoid circular dependency
  authMiddleware(req, res, async () => {
    try {
      await checkExpiryAndSendSMS();
      res.send("✅ Expiry SMS check triggered!");
    } catch (error) {
      console.error("❌ Error sending SMS:", error);
      res.status(500).send("❌ Error sending SMS.");
    }
  });
});

// ✅ Schedule Expiry Check Every Day at Midnight
function scheduleDailyCheck() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeUntilMidnight = midnight - now;
  console.log(`⏳ Scheduling expiry check in ${timeUntilMidnight / 1000 / 60} minutes`);

  setTimeout(() => {
    checkExpiryAndSendSMS();
    setInterval(checkExpiryAndSendSMS, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
}

scheduleDailyCheck();

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
