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
    return res.status(400).send("unauthorized email");
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  req.session.otp = otp;
  req.session.email = email;

  try {
    await sendMail(email`Your OTP for Login`, `Your OTP is: ${otp}`);
    res.status(200).send("OTP sent sucessfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to send OTP");
  }
});

//Verify OTP

router.post("/verify-otp", function (req, res) {
  const { otp } = req.body;

  if (req.session.otp && otp === req.session.otp) {
    req.session.isAuthenticated = true;
    res.status(200).send("Login successful");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

// Middleware to protect admin routes

const verifyAuth = function (req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

router.use("/adminDashboard", verifyAuth, function (req, res) {
  res.sendFile(__dirname + "/admin-dashboard.html");
});

module.exports = router;
