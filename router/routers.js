const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const sendMail = require("./mailer");

const router = express.Router();

router.use(
  session({
    secret: "123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

router.post("/send-otp", async function (req, res) {
  const { email } = req.body;

  if (email !== "regmiganesh87@gmail.com") {
  }
});
