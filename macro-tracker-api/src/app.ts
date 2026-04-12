import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./models/pool.js";
import apiRouter from "./routes/api.router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pgSession = connectPgSimple(session);

const sessionCookieSecure =
  process.env.SESSION_COOKIE_SECURE === "true"
    ? true
    : process.env.SESSION_COOKIE_SECURE === "false"
      ? false
      : process.env.NODE_ENV === "PROD";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "somethingsecret",
    saveUninitialized: false,
    resave: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: sessionCookieSecure,
    },
  }),
);

app.use("/api", apiRouter);

app.all("/*all", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;
