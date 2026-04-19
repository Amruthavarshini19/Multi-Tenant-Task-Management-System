import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authRouter } from "./modules/auth/auth.routes.js";
import { taskRouter } from "./modules/tasks/task.routes.js";
import { orgRouter } from "./modules/organizations/org.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { auditRouter } from "./modules/audit/audit.routes.js";
import { connectDB } from "./config/db.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
  origin: (origin, callback) => {
    // Allow all localhost origins (any port) and requests with no origin (like curl)
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/orgs", orgRouter);
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/audit", auditRouter);

app.use(errorHandler);

await connectDB();
app.listen(4000, () => console.log("Server running on :4000"));