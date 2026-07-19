require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const webpush = require("web-push");

const authRoutes = require("./routes/authRoutes");
const cardRoutes = require("./routes/cardRoutes");
const assetRoutes = require("./routes/assetRoutes");
const bookRoutes = require("./routes/bookRoutes");
const shareRoutes = require("./routes/shareRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const pushRoutes = require("./routes/pushRoutes");

const { startScheduler } = require("./jobs/scheduler");
const { attachSocketServer } = require("./services/notificationService");

// VAPID pour web-push
webpush.setVapidDetails(
  "mailto:contact@cartesetmots.local",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? "https://card.famproject.cloud" : "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev")); 
app.use(express.json({ limit: "10mb" }));
app.set("trust proxy", 1);

app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // large, juste pour éviter l'abus/déni de service basique
});
app.use(globalLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/cards", cardRoutes);
app.use("/assets", assetRoutes);
app.use("/books", bookRoutes);
app.use("/shares", shareRoutes);
app.use("/notifications", notificationRoutes);
app.use("/milestones", milestoneRoutes);
app.use("/push", pushRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // à restreindre au domaine du frontend en prod
});

// Auth du socket via le même JWT que les requêtes HTTP
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Token manquant"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    next();
  } catch (err) {
    next(new Error("Token invalide"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);
});

attachSocketServer(io);


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend démarré sur le port ${PORT}`);
});

startScheduler();