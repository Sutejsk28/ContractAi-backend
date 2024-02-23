import express from "express";
import { config } from "dotenv";
import expressSession from "express-session";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import user from "./routes/user.js";
import contract from "./routes/contract.js";
import { errorMiddleware } from "./middleware/error.js";

config({ path: "./data/config.env" });

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  cors({
    origin: ["http://127.0.0.1:5173/*", process.env.FRONTEND_URL_2],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/api/v1/user", user);
app.use("/api/v1/contract", contract);

app.use(errorMiddleware);
