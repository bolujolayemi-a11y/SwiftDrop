import express from "express";

const router = express.Router();

/* =========================
   IN-MEMORY DATABASE
   ========================= */
let events = [];
let dynamicDrops = [];

/* =========================
   CREATE DROP
   ========================= */
router.post("/create-drop", (req, res) => {
  const dropData = req.body;

  if (!dropData?.title || !dropData?.amount) {
    return res.status(400).json({
      success: false,
      error: "title and amount required"
    });
  }

  const generatedDrop = {
    id: dropData.id || `drop-${Date.now()}`,
    title: dropData.title,
    amount: dropData.amount,
    token: dropData.token || "USDT",
    winnersCount: Number(dropData.winnersCount || 100),
    claimedCount: 0,
    analytics: {
      history: []
    }
  };

  dynamicDrops.unshift(generatedDrop);

  res.json({
    success: true,
    drop: generatedDrop
  });
});

/* =========================
   GET DROP
   ========================= */
router.get("/drop/:id", (req, res) => {
  const clean = (id) =>
    String(id)
      .replace(/^drop_/, "")
      .replace(/^claim_/, "")
      .replace(/^drop-/, "")
      .trim();

  const id = clean(req.params.id);

  const drop = dynamicDrops.find(d => clean(d.id) === id);

  if (!drop) {
    return res.status(404).json({
      success: false,
      error: "Drop not found"
    });
  }

  res.json({
    success: true,
    drop
  });
});

/* =========================
   ADD EVENT (CLAIM / WITHDRAW)
   ========================= */
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
    type: event.type, // claim | withdraw
    userId: event.userId,
    username: event.username || "user",
    amount: Number(event.amount || 0),
    token: event.token || "USDT",
    dropId: event.dropId || null
  };

  events.unshift(newEvent);

  /* update drop analytics if claim */
  if (newEvent.type === "claim" && newEvent.dropId) {
    const drop = dynamicDrops.find(d => String(d.id) === String(newEvent.dropId));

    if (drop) {
      drop.claimedCount += 1;
      drop.analytics.history.unshift({
        username: newEvent.username,
        amount: newEvent.amount,
        time: new Date().toISOString()
      });
    }
  }

  res.json({
    success: true,
    event: newEvent
  });
});

/* =========================
   WALLET (MAIN SOURCE)
   ========================= */
router.post("/wallet", (req, res) => {
  const { userId } = req.body;

  const userEvents = events.filter(
    e => String(e.userId) === String(userId)
  );

  const earnings = userEvents
    .filter(e => e.type === "claim")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const withdrawals = userEvents
    .filter(e => e.type === "withdraw")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  res.json({
    success: true,
    earnings,
    withdrawals,
    balance: earnings - withdrawals,
    events: userEvents
  });
});

/* =========================
   EARNINGS ONLY
   ========================= */
router.post("/earnings", (req, res) => {
  const { userId } = req.body;

  const total = events
    .filter(e =>
      String(e.userId) === String(userId) && e.type === "claim"
    )
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  res.json({
    success: true,
    total
  });
});

/* =========================
   WITHDRAWALS ONLY
   ========================= */
router.post("/withdrawals", (req, res) => {
  const { userId } = req.body;

  const data = events.filter(
    e => String(e.userId) === String(userId) && e.type === "withdraw"
  );

  res.json({
    success: true,
    data
  });
});

export default router;