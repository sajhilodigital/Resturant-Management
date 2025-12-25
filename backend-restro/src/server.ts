// src/server.ts
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
// import compression from "compression";
import "dotenv/config"; // Load .env file
import rateLimit from "express-rate-limit";
import { userRoutes } from "./models/user/user.route";
import { connectDB } from "config/db";
import { authRoutes } from "models/auth/auth.route";

// ────────────────────────────────────────────────
// Environment & Configuration
// ────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Rate limiting config (protects against brute-force & DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  skip: () => NODE_ENV === "development",
});

// ────────────────────────────────────────────────
// Create Express app
// ────────────────────────────────────────────────
const app = express();

// ────────────────────────────────────────────────
// Security & Performance Middleware (Order matters!)
// ────────────────────────────────────────────────
app.set("trust proxy", 1); // Trust first proxy (nginx, cloudflare, etc.)

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// app.use(compression()); // Gzip compression
// List of allowed frontend origins (add your real production domains)
const allowedOrigins = [
  process.env.FRONTEND_URL_LOCAL || "http://localhost:3000", // for local dev
  "https://your-frontend.com", // Your main production frontend
  "https://www.your-frontend.com",
  "https://app.your-frontend.com",
];

// Dynamic CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies, Authorization headers, etc.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Length", "X-Content-Type-Options"],
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

app.use(limiter); // Rate limiting
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev")); // Logging

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection
await connectDB();

// ────────────────────────────────────────────────
// Clean response helpers
// ────────────────────────────────────────────────
const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  status = 200
) => {
  res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (
  res: Response,
  message: string,
  status = 400,
  details?: unknown
) => {
  const payload: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (NODE_ENV !== "production" && details) payload.details = details;
  res.status(status).json(payload);
};

// ────────────────────────────────────────────────
// Basic Routes (add your modules later)
// ────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  sendSuccess(res, {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

app.get("/", (_req, res) => {
  sendSuccess(res, {
    message: "Restaurant Management API",
    version: "1.0.0",
    documentation: "/docs (coming soon)",
  });
});

// Example protected route (you can replace with JWT later)
app.get("/api/secure", (_req, res) => {
  sendSuccess(res, { secret: "This is protected data" });
});

//  All Api Routes
// src/server.ts or src/routes/auth.routes.ts

// WARNING: Remove this in production or protect with secret key!

app.use("/api", userRoutes);
app.use("/api", authRoutes);

// ────────────────────────────────────────────────
// Global Error Handler (very important!)
// ────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  sendError(res, message, status);
});

// ────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 Restaurant Management API                     ║
║   Environment: ${NODE_ENV.padEnd(35)} ║
║   Port:        ${String(PORT).padEnd(35)} ║
║   URL:         http://localhost:${PORT}               ║
║   Health:      http://localhost:${PORT}/health        ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown (important for Docker, PM2, Railway, etc.)
const gracefulShutdown = () => {
  console.log("\nReceived shutdown signal. Closing server...");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export { app }; // For testing if needed
