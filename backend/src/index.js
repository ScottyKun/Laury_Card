require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const cardRoutes = require("./routes/cardRoutes");
const assetRoutes = require("./routes/assetRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
app.use(cors());
app.use(morgan("dev")); 
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/cards", cardRoutes);
app.use("/assets", assetRoutes);
app.use("/books", bookRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend démarré sur le port ${PORT}`);
});