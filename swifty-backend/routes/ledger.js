import express from "express";

const router = express.Router();

// 🚀 Dedicated data tables to simulate an active database instance
let events = [];
let dynamicDrops = []; 

/*
 CREATE / SAVE NEW CAMPAIGN DROP
*/
router.post("/create-drop", (req, res) => {
  const dropData = req.body;

  if (!dropData?.title || !dropData?.amount) {
    return res.status(400).json({
      success: false,
      error: "Headline title and funding allocation capital size are required."
    });
  }

  const generatedDrop = {
    id: dropData.id || `drop-${Date.now()}`,
    claimedCount: 0,
    winnersCount: Number(dropData.winnersCount || 100),
    isMystery: !!dropData.isMystery,
    hasTrivia: !!dropData.trivia,
    token: dropData.token || "USDT",
    title: dropData.title,
    description: dropData.description || "",
    communityUrl: dropData.communityUrl || "https://t.me/swift_dropbot",
    creator: dropData.creator || "swift_merchant",
    trivia: dropData.trivia || null,
    analytics: {
      clicks: 1,
      history: []
    }
  };

  dynamicDrops.unshift(generatedDrop);

  res.json({
    success: true,
    drop: generatedDrop
  });
});

/*
 FETCH SINGLE DROP BY CLEAN PARAMETER ID
*/
router.get("/drop/:id", (req, res) => {
  const { id } = req.params;

  // 🧠 Resilient normalization cleaning helper to strip shared text link prefixes
  const cleanId = (input) => {
    return String(input)
      .replace(/^drop_/, "")
      .replace(/^claim_/, "")
      .replace(/^drop-/, "")
      .trim();
  };

  const targetId = cleanId(id);
  const matchedDrop = dynamicDrops.find(d => cleanId(d.id) === targetId || String(d.id) === String(id));

  if (!matchedDrop) {
    return res.status(404).json({
      success: false,
      error: "Target promotion pool blueprint footprint not found."
    });
  }

  res.json({
    success: true,
    drop: matchedDrop
  });
});

/*
 ADD EVENT (LOG CLAIMS & WITHDRAWALS)
*/
router.post("/event", (req, res) => {
  const event = req.body;

  if (!event?.userId) {
    return res.status(400).json({
      success: false,
      error: "userId required"
    });
  }

  const newEvent = {
    id: Date.now(),
    timestamp: Date.now(),
    ...event
  };

  events.unshift(newEvent);

  // 📈 Dynamic state updater: If it's a claim, push it directly into the campaign drop's live feed history!
  if (event.type === "claim" && event.dropId) {
    const drop = dynamicDrops.find(d => String(d.id) === String(event.dropId));
    if (drop) {
      drop.claimedCount += 1;
      if (!drop.analytics.history) drop.analytics.history = [];
      drop.analytics.history.unshift({
        username: event.username || "anonymous",
        amount: event.amount || "0.00",
        time: "Just now"
      });
    }
  }

  res.json({
    success: true
  });
});

/*
 WALLET DATA CALCULATOR
*/
router.post("/wallet", (req, res) => {
  const { userId } = req.body;

  const userEvents = events.filter(
    e => String(e.userId) === String(userId)
  );

  const earnings = userEvents
    .filter(e => e.type === "claim")
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  const withdrawals = userEvents
    .filter(e => e.type === "withdraw")
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  res.json({
    earnings,
    withdrawals,
    balance: earnings - withdrawals,
    events: userEvents
  });
});

/*
 EARNINGS
*/
router.post("/earnings", (req, res) => {
  const { userId } = req.body;

  const total = events
    .filter(
      e => String(e.userId) === String(userId) && e.type === "claim"
    )
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  res.json({ total });
});

/*
 WITHDRAWALS
*/
router.post("/withdrawals", (req, res) => {
  const { userId } = req.body;

  const data = events.filter(
    e => String(e.userId) === String(userId) && e.type === "withdraw"
  );

  res.json({ data });
});

export default router;