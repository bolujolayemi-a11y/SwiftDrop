import express from "express";

const router = express.Router();

router.post("/me", (req, res) => {
  const initData = req.body?.initData || "";

  if (!initData) {
    return res.json({
      chat_id: "demo_123",
      username: "demo_user",
      first_name: "Demo",
      kyc_verified: false,
      kyc_level: 0,
      referral_code: "DEMO123"
    });
  }

  return res.json({
    chat_id: "tg_001",
    username: "real_user",
    first_name: "Telegram User",
    kyc_verified: true,
    kyc_level: 1,
    referral_code: "REAL123"
  });
});

router.post("/transactions", (req, res) => {
  const page = req.body?.page || 1;

  res.json({
    page,
    transactions: [
      {
        type: "claim",
        amount: 10,
        token: "USDT"
      }
    ]
  });
});

router.get("/rates", (req, res) => {
  res.json({
    USDT: {
      buy: 1500,
      sell: 1490
    }
  });
});

export default router;