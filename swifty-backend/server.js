import express from "express";
import cors from "cors";

import miniappRoutes from "./routes/miniapp.js";
import ledgerRoutes from "./routes/ledger.js";
import botHandler from "../api/bot.js"; // 🚀 IMPORT YOUR BOT CODE

// 🧠 IN-MEMORY DISTRIBUTED LAYER FOR CROSS-DEVICE LINK SHARING
// This holds campaigns globally in server RAM so links resolve on all devices!
const GLOBAL_DROPS_CACHE = {};

const app = express();

app.use(cors());
app.use(express.json());

// 🤖 TELEGRAM BOT WEBHOOK ROUTE BINDING
app.all("/", async (req, res) => {
  await botHandler(req, res);
});

// 💾 CROSS-DEVICE LINK INTERFACES
// Endpoint 1: Device A (Creator) saves the drop data globally to your server
app.post("/ledger/save-shared-drop", (req, res) => {
  const { dropId, dropData } = req.body;
  if (!dropId || !dropData) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  
  GLOBAL_DROPS_CACHE[dropId] = {
    ...dropData,
    timestamp: Date.now()
  };
  
  console.log(`📡 Campaign cached successfully: ${dropId}`);
  return res.status(200).json({ success: true });
});

// Endpoint 2: Device B (Claimer) reads the drop variables via the link parameter
app.get("/ledger/get-shared-drop/:dropId", (req, res) => {
  const { dropId } = req.params;
  const drop = GLOBAL_DROPS_CACHE[dropId];
  
  if (!drop) {
    return res.status(404).json({ success: false, error: "Allocation pool not found" });
  }
  
  return res.status(200).json({ success: true, drop });
});

app.use("/miniapp", miniappRoutes);
app.use("/ledger", ledgerRoutes);

app.listen(8000, () => {
  console.log("Server running on port 8000");
});