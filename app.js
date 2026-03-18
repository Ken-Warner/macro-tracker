const path = require("path");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { pool } = require("./models/pool.js");

const apiRouter = require("./routes/api.router");

const app = express();

//expect json
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//setup session variables
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
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PROD" ? true : false,
    },
  }),
);

app.use("/api", apiRouter);

app.all("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
