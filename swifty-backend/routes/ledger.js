import express from "express";

const router = express.Router();

let events = [];

/*
 ADD EVENT
*/
router.post("/event", (req, res) => {
  const event = req.body;

  if (!event?.userId) {
    return res.status(400).json({
      success: false,
      error: "userId required"
    });
  }

  events.unshift({
    id: Date.now(),
    timestamp: Date.now(),
    ...event
  });

  res.json({
    success: true
  });
});

/*
 WALLET
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
      e =>
        String(e.userId) === String(userId) &&
        e.type === "claim"
    )
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  res.json({
    total
  });
});

/*
 WITHDRAWALS
*/
router.post("/withdrawals", (req, res) => {
  const { userId } = req.body;

  const data = events.filter(
    e =>
      String(e.userId) === String(userId) &&
      e.type === "withdraw"
  );

  res.json({
    data
  });
});

export default router;