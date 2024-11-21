const path = require("path");

const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");

const apiRouter = require("./routes/api.router");
const uiRouter = require("./routes/tmpui/ui.router");

const app = express();

//expect json
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//setup session variables
app.use(express.urlencoded({ extended: true }));
app.use(
  sessions({
    secret: process.env.SESSION_SECRET || "somethingsecret",
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //1 day
    },
    resave: false,
  })
);
app.use(cookieParser());

app.use("/api", apiRouter);

app.all("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
