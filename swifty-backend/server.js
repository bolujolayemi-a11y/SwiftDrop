import express from "express";
import cors from "cors";

import miniappRoutes from "./routes/miniapp.js";
import ledgerRoutes from "./routes/ledger.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/miniapp", miniappRoutes);
app.use("/ledger", ledgerRoutes);

app.listen(8000, () => {
  console.log("Server running on port 8000");
});