import express from "express";
import cors from "cors";
import swaggerDocs from "./utils/swagger/config.js";
import {
  albumsRouter,
  artistsRouter,
  authRouter,
  playlistRouter,
  tracksRouter,
  usersRouter,
} from "./routes/index.js";
import { config } from "dotenv";

// Load env variables
const conf = config();
if (!conf) {
  console.error("ENV vars failed to load");
} else {
  console.log("ENV Vars loaded successfully");
}
const app = express();
const PORT = process.env.RXBE_PORT || 5001;

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:8082",
    "https://resonix.vercel.app",
  ],
  credentials: true,
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/albums", albumsRouter);
app.use("/artists", artistsRouter);
app.use("/auth", authRouter);
app.use("/playlists", playlistRouter);
app.use("/tracks", tracksRouter);
app.use("/users", usersRouter);

// Setup Swagger docs
if (process.env.NODE_ENV !== "production") {
  swaggerDocs(app);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message,
    status: err.status || 500,
  });
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

export default app;
