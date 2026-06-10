import express from "express";

const router = express.Router();

/* =========================
   IN-MEMORY STORAGE ENGINE
   ========================= */
let events = [];
let dynamicDrops = [];

/* =========================
   CREATE CAMPAIGN DROP
   ========================= */
router.post("/create-drop", (req, res) => {
  try {
    const dropData = req.body;

    if (!dropData?.title || !dropData?.amount) {
      return res.status(400).json({
        success: false,
        error: "Campaign title and pool capital amount are required."
      });
    }

    const generatedDrop = {
      id: dropData.id || `drop-${Date.now()}`,
      title: dropData.title,
      description: dropData.description || "",
      amount: parseFloat(dropData.amount),
      token: dropData.token || "USDT",
      winnersCount: Number(dropData.winnersCount || 100),
      claimedCount: 0,
      isMystery: !!dropData.isMystery,
      hasTrivia: !!dropData.hasTrivia,
      trivia: dropData.trivia || null,
      analytics: {
        history: []
      }
    };

    dynamicDrops.unshift(generatedDrop);

    res.json({
      success: true,
      drop: generatedDrop
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal compilation failure." });
  }
});

/* =========================
   GET DROP BY IDENTIFIER
   ========================= */
router.get("/drop/:id", (req, res) => {
  try {
    const clean = (id) =>
      String(id)
        .replace(/^drop_/, "")
        .replace(/^claim_/, "")
        .replace(/^drop-/, "")
        .trim();

    const targetId = clean(req.params.id);

    // Matches clean or raw fallback string signatures smoothly
    const drop = dynamicDrops.find(d => clean(d.id) === targetId || String(d.id) === String(req.params.id));

    if (!drop) {
      return res.status(404).json({
        success: false,
        error: "Campaign reference not resolved."
      });
    }

    res.json({
      success: true,
      drop
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal lookup error." });
  }
});

/* =========================
   ADD EVENT (CLAIM / WITHDRAW)
   ========================= */
router.post("/event", (req, res) => {
  try {
    const event = req.body;

    if (!event?.userId) {
      return res.status(400).json({
        success: false,
        error: "Active user identifier context required."
      });
    }

    const newEvent = {
      id: event.id || Date.now(),
      timestamp: Date.now(),
      type: event.type, // claim | withdraw
      userId: String(event.userId),
      username: event.username || "user",
      amount: Number(event.amount || 0),
      token: event.token || "USDT",
      dropId: event.dropId || null,
      status: event.status || "completed"
    };

    events.unshift(newEvent);

    /* Update drop tracking history if operation type is a reward distribution claim */
    if (newEvent.type === "claim" && newEvent.dropId) {
      const cleanId = (input) => String(input).replace(/^(drop_|claim_|drop-)/, '').trim();
      const targetDropId = cleanId(newEvent.dropId);

      const drop = dynamicDrops.find(d => cleanId(d.id) === targetDropId || String(d.id) === String(newEvent.dropId));

      if (drop) {
        drop.claimedCount += 1;
        if (!drop.analytics) drop.analytics = { history: [] };
        if (!drop.analytics.history) drop.analytics.history = [];
        
        drop.analytics.history.unshift({
          username: newEvent.username,
          userId: newEvent.userId,
          amount: newEvent.amount,
          time: "Just now",
          timestamp: Date.now()
        });
      }
    }

    res.json({
      success: true,
      event: newEvent
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Event logging malfunction." });
  }
});

/* =========================
   WALLET HUB (FIXED: GET VIA PATH PARAMS)
   ========================= */
router.get("/wallet/:userId", (req, res) => {
  try {
    const { userId } = req.params;

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
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to assemble wallet data." });
  }
});

/* =========================
   EARNINGS HISTORY ONLY (FIXED: GET)
   ========================= */
router.get("/earnings/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const total = events
      .filter(e => String(e.userId) === String(userId) && e.type === "claim")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    res.json({
      success: true,
      total
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Retrieval failure." });
  }
});

/* =========================
   WITHDRAWALS TIMELINE (FIXED: GET)
   ========================= */
router.get("/withdrawals/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const data = events.filter(
      e => String(e.userId) === String(userId) && e.type === "withdraw"
    );

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Retrieval failure." });
  }
});

export default router;